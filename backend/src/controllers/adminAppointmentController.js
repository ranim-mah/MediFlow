const { Appointment, Patient, Service } = require('../models');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { APPOINTMENT_STATUS } = require('../utils/constants');

/**
 * GET /api/admin/appointments
 * Filters: scope=upcoming|today|past|all, status, doctorId, branchId, from, to, q
 */
exports.listAppointments = asyncHandler(async (req, res) => {
  const { scope, status, doctorId, branchId, from, to, q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);

  const filter = {};
  const now = new Date();

  if (scope === 'today') {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    filter.scheduledAt = { $gte: start, $lt: end };
  } else if (scope === 'upcoming') {
    filter.scheduledAt = { $gte: now };
    if (!status || status === 'all') {
      filter.status = { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETED] };
    }
  } else if (scope === 'past') {
    filter.scheduledAt = { $lt: now };
  }

  if (status && status !== 'all') filter.status = status;
  if (doctorId) filter.doctorId = doctorId;
  if (branchId) filter.branchId = branchId;

  if (from || to) {
    filter.scheduledAt = filter.scheduledAt || {};
    if (from) filter.scheduledAt.$gte = new Date(from);
    if (to) filter.scheduledAt.$lte = new Date(to);
  }

  // Text search: match patient by name/phone first
  if (q) {
    const patients = await Patient.find({
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { patientCode: { $regex: q, $options: 'i' } },
      ],
    }).select('_id').limit(100);
    filter.patientId = { $in: patients.map((p) => p._id) };
  }

  const [items, total, countsAgg] = await Promise.all([
    Appointment.find(filter)
      .sort({ scheduledAt: scope === 'past' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('patientId', 'fullName phone patientCode')
      .populate('serviceId', 'name price')
      .populate('branchId', 'name')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } }),
    Appointment.countDocuments(filter),
    Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const countsByStatus = countsAgg.reduce((acc, c) => {
    acc[c._id] = c.count;
    return acc;
  }, {});

  res.json({
    success: true,
    data: { items, total, page, pages: Math.ceil(total / limit), countsByStatus },
  });
});

/**
 * POST /api/admin/appointments
 */
exports.createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, serviceId, branchId, scheduledAt, durationMinutes, notes } = req.body;
  if (!patientId || !branchId || !scheduledAt) {
    throw new ApiError(400, 'patientId, branchId et scheduledAt requis');
  }

  let duration = durationMinutes || 30;
  if (serviceId) {
    const s = await Service.findById(serviceId);
    if (s) duration = durationMinutes || s.defaultDuration || 30;
  }

  const appointment = await Appointment.create({
    patientId, doctorId, serviceId, branchId,
    scheduledAt: new Date(scheduledAt),
    durationMinutes: duration,
    status: APPOINTMENT_STATUS.CONFIRMED,
    source: 'admin',
    notes,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: appointment });
});

/**
 * PATCH /api/admin/appointments/:id/status
 */
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!Object.values(APPOINTMENT_STATUS).includes(status)) {
    throw new ApiError(400, 'Statut invalide');
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, 'Rendez-vous introuvable');

  appointment.status = status;
  if (status === APPOINTMENT_STATUS.IN_PROGRESS) appointment.startedAt = new Date();
  if (status === APPOINTMENT_STATUS.COMPLETED) appointment.completedAt = new Date();
  if (status === APPOINTMENT_STATUS.CANCELLED) {
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user._id;
  }
  await appointment.save();

  res.json({ success: true, data: appointment });
});

/**
 * GET /api/admin/calendar?month=YYYY-MM
 */
exports.getCalendarMonth = asyncHandler(async (req, res) => {
  const month = req.query.month;
  let start, end;
  if (month) {
    const [y, m] = month.split('-').map(Number);
    start = new Date(y, m - 1, 1);
    end = new Date(y, m, 1);
  } else {
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const items = await Appointment.find({ scheduledAt: { $gte: start, $lt: end } })
    .sort({ scheduledAt: 1 })
    .populate('patientId', 'fullName phone patientCode')
    .populate('serviceId', 'name')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } });

  res.json({
    success: true,
    data: {
      month: start.toISOString().slice(0, 7),
      start: start.toISOString(),
      end: end.toISOString(),
      items,
    },
  });
});