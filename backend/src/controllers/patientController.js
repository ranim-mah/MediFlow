const mongoose = require('mongoose');
const {
  Patient, Appointment, Visit, Prescription, LabTest, Radiology,
  Procedure, Referral, Invoice, Notification, Queue, Service, Branch, Doctor, User,
} = require('../models');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { APPOINTMENT_STATUS } = require('../utils/constants');
const { notifyAppointmentPatient } = require('../services/notificationService');

/**
 * Helper: resolve the Patient document linked to the authenticated user.
 */
const getPatientForUser = async (userId) => {
  const patient = await Patient.findOne({ userId });
  if (!patient) throw new ApiError(404, 'Aucun dossier patient lié à ce compte');
  return patient;
};

/**
 * GET /api/patient/me
 * Dashboard overview: profile + stats + next appointment + recent items.
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const patient = await getPatientForUser(req.user._id);

  // Next upcoming appointment
  const nextAppointment = await Appointment.findOne({
    patientId: patient._id,
    scheduledAt: { $gte: new Date() },
    status: { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.WAITING] },
  })
    .sort({ scheduledAt: 1 })
    .populate('serviceId', 'name')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } });

  const [
    upcomingCount, pastCount, prescriptionsCount, labCount, radiologyCount, unreadNotifCount,
    lastPrescription, lastLab, lastRadiology,
  ] = await Promise.all([
    Appointment.countDocuments({
      patientId: patient._id,
      scheduledAt: { $gte: new Date() },
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETED] },
    }),
    Appointment.countDocuments({
      patientId: patient._id,
      status: APPOINTMENT_STATUS.COMPLETED,
    }),
    Prescription.countDocuments({ patientId: patient._id }),
    LabTest.countDocuments({ patientId: patient._id }),
    Radiology.countDocuments({ patientId: patient._id }),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
    Prescription.findOne({ patientId: patient._id }).sort({ createdAt: -1 }),
    LabTest.findOne({ patientId: patient._id }).sort({ createdAt: -1 }),
    Radiology.findOne({ patientId: patient._id }).sort({ createdAt: -1 }),
  ]);

  res.json({
    success: true,
    data: {
      patient,
      stats: {
        upcoming: upcomingCount,
        past: pastCount,
        prescriptions: prescriptionsCount,
        labs: labCount,
        radiology: radiologyCount,
        unreadNotifications: unreadNotifCount,
        totalFiles: prescriptionsCount + labCount + radiologyCount,
      },
      nextAppointment,
      recent: {
        lastPrescription,
        lastLab,
        lastRadiology,
      },
    },
  });
});

/**
 * GET /api/patient/appointments
 * Query: ?scope=upcoming|past|all (default all)
 */
exports.listAppointments = asyncHandler(async (req, res) => {
  const patient = await getPatientForUser(req.user._id);
  const { scope = 'all' } = req.query;

  const filter = { patientId: patient._id };
  if (scope === 'upcoming') {
    filter.scheduledAt = { $gte: new Date() };
    filter.status = { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETED] };
  } else if (scope === 'past') {
    filter.$or = [
      { scheduledAt: { $lt: new Date() } },
      { status: { $in: [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.CANCELLED] } },
    ];
  }

  const appointments = await Appointment.find(filter)
    .sort({ scheduledAt: scope === 'past' ? -1 : 1 })
    .populate('serviceId', 'name price')
    .populate('branchId', 'name')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } })
    .limit(100);

  res.json({ success: true, data: appointments });
});

/**
 * POST /api/patient/appointments
 * Create a new appointment from the patient portal.
 */
exports.createAppointment = asyncHandler(async (req, res) => {
  const patient = await getPatientForUser(req.user._id);
  const { serviceId, branchId, scheduledAt, notes } = req.body;

  if (!branchId || !scheduledAt) throw new ApiError(400, 'branchId et scheduledAt requis');

  const branch = await Branch.findById(branchId);
  if (!branch) throw new ApiError(404, 'Succursale introuvable');

  let duration = 30;
  if (serviceId) {
    const s = await Service.findById(serviceId);
    if (s) duration = s.defaultDuration || 30;
  }

  const appointment = await Appointment.create({
    patientId: patient._id,
    serviceId,
    branchId,
    scheduledAt: new Date(scheduledAt),
    durationMinutes: duration,
    status: APPOINTMENT_STATUS.PENDING,
    source: 'patient_portal',
    notes,
    createdBy: req.user._id,
  });

  await notifyAppointmentPatient(appointment._id, {
    type: 'appointment_created',
    title: 'Rendez-vous demande',
    body: `Votre rendez-vous du ${new Date(appointment.scheduledAt).toLocaleString()} a ete cree et attend confirmation.`,
    link: '/patient/appointments',
    priority: 'normal',
  });

  res.status(201).json({ success: true, data: appointment });
});

/**
 * PATCH /api/patient/appointments/:id/cancel
 * Rule: allowed only up to 6h before scheduledAt (matches Mediflow's hint).
 */
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const patient = await getPatientForUser(req.user._id);
  const appointment = await Appointment.findOne({ _id: req.params.id, patientId: patient._id });
  if (!appointment) throw new ApiError(404, 'Rendez-vous introuvable');

  if ([APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETED].includes(appointment.status)) {
    throw new ApiError(400, 'Ce rendez-vous ne peut plus être annulé');
  }

  const hoursBefore = (appointment.scheduledAt.getTime() - Date.now()) / 36e5;
  if (hoursBefore < 6) {
    throw new ApiError(400, 'Annulation possible uniquement 6h avant le rendez-vous');
  }

  appointment.status = APPOINTMENT_STATUS.CANCELLED;
  appointment.cancelledAt = new Date();
  appointment.cancelledBy = req.user._id;
  appointment.cancelReason = req.body?.reason || 'Annulé par le patient';
  await appointment.save();

  await notifyAppointmentPatient(appointment._id, {
    type: 'appointment_cancelled',
    title: 'Rendez-vous annule',
    body: `Votre rendez-vous du ${new Date(appointment.scheduledAt).toLocaleString()} a ete annule.`,
    link: '/patient/appointments',
    priority: 'high',
  });

  res.json({ success: true, data: appointment });
});

/**
 * GET /api/patient/medical-file
 * Full record overview for the "Medical File" page.
 */
exports.getMedicalFile = asyncHandler(async (req, res) => {
  const patient = await getPatientForUser(req.user._id);

  const [visits, lastVisit, prescriptionsCount, procedures, referralsCount] = await Promise.all([
    Visit.find({ patientId: patient._id })
      .sort({ visitDate: -1 })
      .limit(50)
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } })
      .populate('serviceId', 'name'),
    Visit.findOne({ patientId: patient._id }).sort({ visitDate: -1 }),
    Prescription.countDocuments({ patientId: patient._id }),
    Procedure.find({ patientId: patient._id }).sort({ performedAt: -1 }).limit(20),
    Referral.countDocuments({ patientId: patient._id }),
  ]);

  res.json({
    success: true,
    data: {
      patient,
      stats: {
        totalVisits: visits.length,
        proceduresCount: procedures.length,
        referralsCount,
        prescriptionsCount,
      },
      lastVisitDate: lastVisit?.visitDate,
      visits,
      procedures,
    },
  });
});

/**
 * GET /api/patient/timeline
 * Unified chronological feed: appointments, visits, prescriptions, labs, radiology, procedures.
 */
exports.getTimeline = asyncHandler(async (req, res) => {
  const patient = await getPatientForUser(req.user._id);
  const pid = patient._id;

  const [appointments, visits, prescriptions, labs, radiology, procedures] = await Promise.all([
    Appointment.find({ patientId: pid }).sort({ scheduledAt: -1 }).limit(30)
      .populate('serviceId', 'name')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } }),
    Visit.find({ patientId: pid }).sort({ visitDate: -1 }).limit(30),
    Prescription.find({ patientId: pid }).sort({ issuedAt: -1 }).limit(30),
    LabTest.find({ patientId: pid }).sort({ requestedAt: -1 }).limit(30),
    Radiology.find({ patientId: pid }).sort({ requestedAt: -1 }).limit(30),
    Procedure.find({ patientId: pid }).sort({ performedAt: -1 }).limit(30),
  ]);

  const events = [
    ...appointments.map((a) => ({
      type: 'appointment',
      date: a.scheduledAt,
      id: a._id,
      status: a.status,
      title: a.serviceId?.name || null,
      doctor: a.doctorId?.userId?.fullName,
      data: a,
    })),
    ...visits.map((v) => ({ type: 'visit', date: v.visitDate, id: v._id, title: v.diagnosis || 'Visite', data: v })),
    ...prescriptions.map((p) => ({ type: 'prescription', date: p.issuedAt, id: p._id, title: `${p.medications?.length || 0} médicament(s)`, data: p })),
    ...labs.map((l) => ({ type: 'lab', date: l.requestedAt, id: l._id, status: l.status, title: l.tests?.map((t) => t.name).join(', '), data: l })),
    ...radiology.map((r) => ({ type: 'radiology', date: r.requestedAt, id: r._id, status: r.status, title: r.exams?.map((e) => e.name).join(', '), data: r })),
    ...procedures.map((p) => ({ type: 'procedure', date: p.performedAt, id: p._id, title: p.name, data: p })),
  ];

  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({
    success: true,
    data: {
      counts: {
        total: events.length,
        appointments: appointments.length,
        prescriptions: prescriptions.length,
        labs: labs.length,
        radiology: radiology.length,
        procedures: procedures.length,
        visits: visits.length,
      },
      events,
    },
  });
});

/**
 * GET /api/patient/queue
 * Today's queue status for this patient (الدور).
 */
exports.getQueue = asyncHandler(async (req, res) => {
  const patient = await getPatientForUser(req.user._id);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const myEntry = await Queue.findOne({
    patientId: patient._id,
    queueDate: { $gte: today, $lt: tomorrow },
  })
    .populate('appointmentId')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } });

  if (!myEntry) {
    return res.json({
      success: true,
      data: { hasEntry: false, message: 'Aucune file active aujourd\'hui' },
    });
  }

  // Count people ahead of me and currently in session
  const [ahead, current, completedToday] = await Promise.all([
    Queue.countDocuments({
      branchId: myEntry.branchId,
      doctorId: myEntry.doctorId,
      queueDate: myEntry.queueDate,
      queueNumber: { $lt: myEntry.queueNumber },
      status: { $in: ['waiting', 'called'] },
    }),
    Queue.findOne({
      branchId: myEntry.branchId,
      doctorId: myEntry.doctorId,
      queueDate: myEntry.queueDate,
      status: 'in_session',
    }).select('queueNumber'),
    Queue.countDocuments({
      branchId: myEntry.branchId,
      doctorId: myEntry.doctorId,
      queueDate: myEntry.queueDate,
      status: 'completed',
    }),
  ]);

  res.json({
    success: true,
    data: {
      hasEntry: true,
      myNumber: myEntry.queueNumber,
      status: myEntry.status,
      ahead,
      currentNumber: current?.queueNumber || 0,
      completedToday,
      doctor: myEntry.doctorId?.userId?.fullName,
      appointment: myEntry.appointmentId,
    },
  });
});

/**
 * GET /api/patient/notifications
 */
exports.listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: notifications });
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.updateOne(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true, readAt: new Date() }
  );
  res.json({ success: true });
});

exports.markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  res.json({ success: true });
});
