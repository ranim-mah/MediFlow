const { Appointment, Doctor, Visit } = require('../models');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { APPOINTMENT_STATUS } = require('../utils/constants');
const { notifyAppointmentPatient } = require('../services/notificationService');

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

const getDoctorProfile = async (userId) => {
  const doctor = await Doctor.findOne({ userId }).populate('userId', 'fullName email');
  if (!doctor) throw new ApiError(404, 'Profil medecin introuvable');
  return doctor;
};

/**
 * GET /api/doctor/focus
 */
exports.getFocusBoard = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfile(req.user._id);
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const base = {
    doctorId: doctor._id,
    scheduledAt: { $gte: todayStart, $lte: todayEnd },
  };

  const [todayTotal, waitingCount, inProgressCount, doneCount, nextAppointments] = await Promise.all([
    Appointment.countDocuments(base),
    Appointment.countDocuments({ ...base, status: APPOINTMENT_STATUS.WAITING }),
    Appointment.countDocuments({ ...base, status: APPOINTMENT_STATUS.IN_PROGRESS }),
    Appointment.countDocuments({ ...base, status: APPOINTMENT_STATUS.COMPLETED }),
    Appointment.find({
      ...base,
      status: {
        $in: [
          APPOINTMENT_STATUS.PENDING,
          APPOINTMENT_STATUS.CONFIRMED,
          APPOINTMENT_STATUS.WAITING,
          APPOINTMENT_STATUS.IN_PROGRESS,
        ],
      },
      scheduledAt: { $gte: now, $lte: todayEnd },
    })
      .sort({ scheduledAt: 1 })
      .limit(12)
      .populate('patientId', 'fullName patientCode phone')
      .populate('serviceId', 'name')
      .populate('branchId', 'name city'),
  ]);

  res.json({
    success: true,
    data: {
      doctor: {
        _id: doctor._id,
        fullName: doctor.userId?.fullName,
        specialty: doctor.specialty,
      },
      kpis: {
        todayTotal,
        waitingCount,
        inProgressCount,
        doneCount,
      },
      nextAppointments,
    },
  });
});

/**
 * GET /api/doctor/appointments
 * Query: status, date
 */
exports.listMyAppointments = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfile(req.user._id);
  const status = String(req.query.status || '').trim();
  const date = String(req.query.date || '').trim();

  const filter = { doctorId: doctor._id };
  if (status) filter.status = status;

  if (date) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) throw new ApiError(400, 'Date invalide');
    filter.scheduledAt = { $gte: startOfDay(d), $lte: endOfDay(d) };
  } else {
    filter.scheduledAt = { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) };
  }

  const items = await Appointment.find(filter)
    .sort({ scheduledAt: 1 })
    .populate('patientId', 'fullName patientCode phone')
    .populate('serviceId', 'name')
    .populate('branchId', 'name city');

  res.json({ success: true, data: { items } });
});

/**
 * PATCH /api/doctor/appointments/:id/status
 */
exports.updateMyAppointmentStatus = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfile(req.user._id);
  const { id } = req.params;
  const { status } = req.body || {};

  const allowed = [
    APPOINTMENT_STATUS.CONFIRMED,
    APPOINTMENT_STATUS.WAITING,
    APPOINTMENT_STATUS.IN_PROGRESS,
    APPOINTMENT_STATUS.COMPLETED,
    APPOINTMENT_STATUS.NO_SHOW,
    APPOINTMENT_STATUS.CANCELLED,
  ];
  if (!allowed.includes(status)) throw new ApiError(400, 'Statut invalide');

  const appointment = await Appointment.findById(id);
  if (!appointment) throw new ApiError(404, 'Rendez-vous introuvable');
  if (String(appointment.doctorId) !== String(doctor._id)) {
    throw new ApiError(403, 'Ce rendez-vous ne vous appartient pas');
  }

  appointment.status = status;
  if (status === APPOINTMENT_STATUS.IN_PROGRESS && !appointment.startedAt) {
    appointment.startedAt = new Date();
  }
  if (status === APPOINTMENT_STATUS.COMPLETED && !appointment.completedAt) {
    appointment.completedAt = new Date();
  }
  if (status === APPOINTMENT_STATUS.CANCELLED && !appointment.cancelledAt) {
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user._id;
  }

  await appointment.save();

  await notifyAppointmentPatient(appointment._id, {
    type: 'appointment_modified',
    title: 'Mise a jour du rendez-vous',
    body: `Le statut de votre rendez-vous est maintenant: ${status}.`,
    link: '/patient/appointments',
    priority: status === APPOINTMENT_STATUS.COMPLETED ? 'normal' : 'high',
  });

  res.json({ success: true, data: { _id: appointment._id, status: appointment.status } });
});

/**
 * GET /api/doctor/appointments/:id
 * Full appointment details + linked visit
 */
exports.getAppointmentDetail = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfile(req.user._id);
  const appt = await Appointment.findById(req.params.id)
    .populate('patientId', 'fullName patientCode phone age bloodType allergies chronicConditions healthSummary')
    .populate('serviceId', 'name price currency')
    .populate('branchId', 'name city');

  if (!appt) throw new ApiError(404, 'Rendez-vous introuvable');
  if (String(appt.doctorId) !== String(doctor._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Accès refusé');
  }

  let visit = null;
  if (appt.visitId) {
    visit = await Visit.findById(appt.visitId).select('complaint diagnosis plan decision vitals status startedAt endedAt');
  }

  res.json({ success: true, data: { appointment: appt, visit, doctor: { _id: doctor._id, specialty: doctor.specialty } } });
});

/**
 * PATCH /api/doctor/visits/:visitId
 * Save visit notes (complaint, diagnosis, plan, decision)
 */
exports.saveVisitNotes = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfile(req.user._id);
  const { visitId } = req.params;
  const { complaint, diagnosis, plan, decision, vitals } = req.body || {};

  const visit = await Visit.findById(visitId);
  if (!visit) throw new ApiError(404, 'Visite introuvable');
  if (String(visit.doctorId) !== String(doctor._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Accès refusé');
  }

  if (complaint !== undefined) visit.complaint = complaint;
  if (diagnosis !== undefined) visit.diagnosis = diagnosis;
  if (plan !== undefined) visit.plan = plan;
  if (decision !== undefined) visit.decision = decision;
  if (vitals && typeof vitals === 'object') visit.vitals = { ...visit.vitals, ...vitals };

  await visit.save();
  res.json({ success: true, data: visit });
});

/**
 * POST /api/doctor/appointments/:id/start-visit
 * Start a visit session for an appointment
 */
exports.startVisit = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfile(req.user._id);
  const appt = await Appointment.findById(req.params.id);
  if (!appt) throw new ApiError(404, 'Rendez-vous introuvable');
  if (String(appt.doctorId) !== String(doctor._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Accès refusé');
  }

  // Reuse existing visit or create new
  let visit = appt.visitId ? await Visit.findById(appt.visitId) : null;
  if (!visit) {
    visit = await Visit.create({
      patientId: appt.patientId,
      doctorId: doctor._id,
      appointmentId: appt._id,
      branchId: appt.branchId,
      serviceId: appt.serviceId,
      status: 'in_session',
      startedAt: new Date(),
    });
    appt.visitId = visit._id;
  }

  appt.status = 'in_progress';
  if (!appt.startedAt) appt.startedAt = new Date();
  await appt.save();

  res.json({ success: true, data: { visit, appointment: appt } });
});
