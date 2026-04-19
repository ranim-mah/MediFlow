const {
  Patient,
  Appointment,
  Visit,
  Prescription,
  LabTest,
  Radiology,
  Queue,
  Invoice,
  Doctor,
  Staff,
  Branch,
} = require('../models');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { APPOINTMENT_STATUS } = require('../utils/constants');

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const endOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

/**
 * GET /api/admin/dashboard
 * Admin overview: KPIs + upcoming appointments + queue summary.
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

  const [
    totalPatients,
    totalDoctors,
    totalStaff,
    appointmentsToday,
    pendingToday,
    activeQueueToday,
    invoicesMonth,
    upcomingAppointments,
  ] = await Promise.all([
    Patient.countDocuments({}),
    Doctor.countDocuments({ isActive: { $ne: false } }),
    Staff.countDocuments({ isActive: { $ne: false } }),
    Appointment.countDocuments({ scheduledAt: { $gte: todayStart, $lte: todayEnd } }),
    Appointment.countDocuments({
      scheduledAt: { $gte: todayStart, $lte: todayEnd },
      status: { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.WAITING] },
    }),
    Queue.countDocuments({
      queueDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['waiting', 'called', 'in_session'] },
    }),
    Invoice.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          status: { $in: ['partial', 'paid'] },
        },
      },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$amountPaid' },
          totalInvoiced: { $sum: '$total' },
          totalBalance: { $sum: '$balance' },
        },
      },
    ]),
    Appointment.find({
      scheduledAt: { $gte: new Date() },
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETED] },
    })
      .sort({ scheduledAt: 1 })
      .limit(12)
      .populate('patientId', 'fullName patientCode phone')
      .populate('serviceId', 'name price currency')
      .populate('branchId', 'name city')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } }),
  ]);

  const billing = invoicesMonth[0] || { totalPaid: 0, totalInvoiced: 0, totalBalance: 0 };

  res.json({
    success: true,
    data: {
      kpis: {
        totalPatients,
        totalDoctors,
        totalStaff,
        appointmentsToday,
        pendingToday,
        activeQueueToday,
        monthlyRevenue: billing.totalPaid || 0,
        monthlyInvoiced: billing.totalInvoiced || 0,
        monthlyBalance: billing.totalBalance || 0,
      },
      upcomingAppointments,
    },
  });
});

/**
 * GET /api/admin/patients
 * Query: q, page, limit, risk=high|chronic
 */
exports.listPatients = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
  const skip = (page - 1) * limit;
  const risk = String(req.query.risk || '').trim();

  const filter = {};
  if (q) {
    filter.$or = [
      { fullName: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { patientCode: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }
  if (risk === 'high') filter.isHighRisk = true;
  if (risk === 'chronic') filter.isChronic = true;

  const [items, total, highRiskCount, chronicCount] = await Promise.all([
    Patient.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('branchId', 'name city')
      .select('patientCode fullName phone email age bloodType isHighRisk isChronic flags outstandingBalance branchId lastVisitAt createdAt'),
    Patient.countDocuments(filter),
    Patient.countDocuments({ ...filter, isHighRisk: true }),
    Patient.countDocuments({ ...filter, isChronic: true }),
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
      summary: {
        highRiskCount,
        chronicCount,
      },
    },
  });
});

/**
 * GET /api/admin/patients/:id
 */
exports.getPatientDetails = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id)
    .populate('branchId', 'name city')
    .populate('userId', 'fullName email phone isActive');

  if (!patient) throw new ApiError(404, 'Patient introuvable');

  const [appointments, visits, prescriptions, labs, radiology] = await Promise.all([
    Appointment.find({ patientId: patient._id })
      .sort({ scheduledAt: -1 })
      .limit(20)
      .populate('serviceId', 'name')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } }),
    Visit.find({ patientId: patient._id }).sort({ visitDate: -1 }).limit(20),
    Prescription.find({ patientId: patient._id }).sort({ issuedAt: -1 }).limit(20),
    LabTest.find({ patientId: patient._id }).sort({ requestedAt: -1 }).limit(20),
    Radiology.find({ patientId: patient._id }).sort({ requestedAt: -1 }).limit(20),
  ]);

  res.json({
    success: true,
    data: {
      patient,
      files: {
        appointments,
        visits,
        prescriptions,
        labs,
        radiology,
      },
    },
  });
});

/**
 * GET /api/admin/appointments/calendar
 * Query: start, end, branchId
 */
exports.getCalendar = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = req.query.start ? new Date(req.query.start) : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = req.query.end ? new Date(req.query.end) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ApiError(400, 'Parametres start/end invalides');
  }

  const filter = {
    scheduledAt: { $gte: start, $lte: end },
  };
  if (req.query.branchId) filter.branchId = req.query.branchId;

  const [appointments, branches] = await Promise.all([
    Appointment.find(filter)
      .sort({ scheduledAt: 1 })
      .populate('patientId', 'fullName patientCode phone')
      .populate('serviceId', 'name')
      .populate('branchId', 'name city')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } }),
    Branch.find({ isActive: true }).select('name city').sort({ isMain: -1, name: 1 }),
  ]);

  const countsByDay = {};
  const events = appointments.map((a) => {
    const dayKey = new Date(a.scheduledAt).toISOString().slice(0, 10);
    countsByDay[dayKey] = (countsByDay[dayKey] || 0) + 1;
    return {
      _id: a._id,
      scheduledAt: a.scheduledAt,
      status: a.status,
      patient: a.patientId,
      doctor: a.doctorId?.userId?.fullName || null,
      service: a.serviceId,
      branch: a.branchId,
      source: a.source,
      notes: a.notes,
    };
  });

  res.json({
    success: true,
    data: {
      range: { start, end },
      events,
      countsByDay,
      branches,
    },
  });
});

/**
 * PATCH /api/admin/appointments/:id/status
 * Body: { status, reason? }
 */
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body || {};

  const allowed = [
    APPOINTMENT_STATUS.PENDING,
    APPOINTMENT_STATUS.CONFIRMED,
    APPOINTMENT_STATUS.WAITING,
    APPOINTMENT_STATUS.IN_PROGRESS,
    APPOINTMENT_STATUS.COMPLETED,
    APPOINTMENT_STATUS.CANCELLED,
    APPOINTMENT_STATUS.NO_SHOW,
  ];

  if (!allowed.includes(status)) {
    throw new ApiError(400, 'Statut de rendez-vous invalide');
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) throw new ApiError(404, 'Rendez-vous introuvable');

  appointment.status = status;

  if (status === APPOINTMENT_STATUS.CANCELLED) {
    appointment.cancelledAt = new Date();
    appointment.cancelReason = String(reason || '').trim() || undefined;
    appointment.cancelledBy = req.user?._id;
  }

  if (status === APPOINTMENT_STATUS.IN_PROGRESS) {
    appointment.startedAt = appointment.startedAt || new Date();
  }

  if (status === APPOINTMENT_STATUS.COMPLETED) {
    appointment.completedAt = appointment.completedAt || new Date();
  }

  await appointment.save();

  const updated = await Appointment.findById(appointment._id)
    .populate('patientId', 'fullName patientCode phone')
    .populate('serviceId', 'name')
    .populate('branchId', 'name city')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } });

  res.json({
    success: true,
    message: 'Statut du rendez-vous mis a jour',
    data: updated,
  });
});