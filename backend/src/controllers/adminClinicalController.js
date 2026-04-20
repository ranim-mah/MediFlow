const {
  Visit, Appointment, Patient, Prescription, LabTest, Radiology,
  Procedure, Referral, Notification,
} = require('../models');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { APPOINTMENT_STATUS, VISIT_STATUS, ROLES } = require('../utils/constants');

/**
 * POST /api/admin/visits
 * Start a new doctor session (Doctor Focus Mode entry point).
 * Body: { patientId, appointmentId?, serviceId?, doctorId?, branchId }
 */
exports.startVisit = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, serviceId, doctorId, branchId } = req.body;
  if (!patientId || !branchId) throw new ApiError(400, 'patientId et branchId requis');

  // If doctor role, auto-detect their Doctor doc from userId
  let docId = doctorId;
  if (!docId && req.user.role === ROLES.DOCTOR) {
    const { Doctor } = require('../models');
    const d = await Doctor.findOne({ userId: req.user._id });
    if (d) docId = d._id;
  }
  if (!docId) throw new ApiError(400, 'doctorId requis');

  const visit = await Visit.create({
    patientId, doctorId: docId, appointmentId, serviceId, branchId,
    status: VISIT_STATUS.IN_SESSION,
    startedAt: new Date(),
    createdBy: req.user._id,
  });

  // Link appointment → visit and mark in_progress
  if (appointmentId) {
    await Appointment.updateOne(
      { _id: appointmentId },
      { $set: { visitId: visit._id, status: APPOINTMENT_STATUS.IN_PROGRESS, startedAt: new Date() } }
    );
  }

  res.status(201).json({ success: true, data: visit });
});

/**
 * GET /api/admin/visits/:id
 * Full visit data + linked records, for the focus mode page.
 */
exports.getVisit = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id)
    .populate('patientId')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } })
    .populate('serviceId', 'name price')
    .populate('appointmentId')
    .populate('prescriptionIds')
    .populate('labTestIds')
    .populate('radiologyIds')
    .populate('procedureIds')
    .populate('referralIds');

  if (!visit) throw new ApiError(404, 'Visite introuvable');
  res.json({ success: true, data: visit });
});

/**
 * PATCH /api/admin/visits/:id
 * Update visit fields (complaint/diagnosis/plan/decision/vitals/exam/follow-up).
 */
exports.updateVisit = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) throw new ApiError(404, 'Visite introuvable');

  const allowed = [
    'complaint', 'diagnosis', 'plan', 'decision',
    'physicalExam', 'followUpNotes', 'followUpDate', 'vitals',
  ];
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) visit[k] = req.body[k];
  });
  await visit.save();
  res.json({ success: true, data: visit });
});

/**
 * POST /api/admin/visits/:id/end
 * Close the visit, mark the appointment completed, notify patient.
 */
exports.endVisit = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) throw new ApiError(404, 'Visite introuvable');

  visit.status = VISIT_STATUS.COMPLETED;
  visit.endedAt = new Date();
  if (visit.startedAt) {
    visit.durationMinutes = Math.round((visit.endedAt - visit.startedAt) / 60000);
  }
  await visit.save();

  if (visit.appointmentId) {
    await Appointment.updateOne(
      { _id: visit.appointmentId },
      { $set: { status: APPOINTMENT_STATUS.COMPLETED, completedAt: new Date() } }
    );
  }

  // Bump patient stats
  await Patient.updateOne(
    { _id: visit.patientId },
    {
      $inc: { totalVisits: 1 },
      $set: { lastVisitAt: new Date() },
    }
  );

  res.json({ success: true, data: visit });
});

// ============================================================
// Prescription / Lab / Radiology — all attach to a visit
// ============================================================

/**
 * POST /api/admin/visits/:id/prescriptions
 * Body: { medications: [...], notes }
 */
exports.addPrescription = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) throw new ApiError(404, 'Visite introuvable');

  const { medications, notes } = req.body;
  if (!Array.isArray(medications) || medications.length === 0) {
    throw new ApiError(400, 'Au moins un médicament requis');
  }

  const rx = await Prescription.create({
    patientId: visit.patientId,
    doctorId: visit.doctorId,
    visitId: visit._id,
    branchId: visit.branchId,
    medications, notes,
    issuedAt: new Date(),
  });

  visit.prescriptionIds.push(rx._id);
  await visit.save();

  await Patient.updateOne({ _id: visit.patientId }, { $inc: { totalPrescriptions: 1 } });

  // Notify patient if they have an account
  const patient = await Patient.findById(visit.patientId);
  if (patient?.userId) {
    await Notification.create({
      userId: patient.userId,
      type: 'prescription_ready',
      title: 'روشتة جديدة',
      body: 'تمت إضافة روشتة جديدة إلى ملفك الطبي',
      channels: ['in_app'],
      relatedId: rx._id,
      relatedType: 'Prescription',
      link: '/portal/timeline',
    });
  }

  res.status(201).json({ success: true, data: rx });
});

/**
 * POST /api/admin/visits/:id/lab-tests
 * Body: { tests: [{ name, code?, notes? }], notes }
 */
exports.addLabTest = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) throw new ApiError(404, 'Visite introuvable');

  const { tests, notes } = req.body;
  if (!Array.isArray(tests) || tests.length === 0) {
    throw new ApiError(400, 'Au moins un test requis');
  }

  const lab = await LabTest.create({
    patientId: visit.patientId,
    doctorId: visit.doctorId,
    visitId: visit._id,
    branchId: visit.branchId,
    tests, notes,
    status: 'requested',
    requestedAt: new Date(),
  });

  visit.labTestIds.push(lab._id);
  await visit.save();
  await Patient.updateOne({ _id: visit.patientId }, { $inc: { totalLabTests: 1 } });

  res.status(201).json({ success: true, data: lab });
});

/**
 * POST /api/admin/visits/:id/radiology
 * Body: { exams: [{ name, bodyPart?, notes? }], notes }
 */
exports.addRadiology = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) throw new ApiError(404, 'Visite introuvable');

  const { exams, notes } = req.body;
  if (!Array.isArray(exams) || exams.length === 0) {
    throw new ApiError(400, 'Au moins un examen requis');
  }

  const rad = await Radiology.create({
    patientId: visit.patientId,
    doctorId: visit.doctorId,
    visitId: visit._id,
    branchId: visit.branchId,
    exams, notes,
    status: 'requested',
    requestedAt: new Date(),
  });

  visit.radiologyIds.push(rad._id);
  await visit.save();
  await Patient.updateOne({ _id: visit.patientId }, { $inc: { totalRadiology: 1 } });

  res.status(201).json({ success: true, data: rad });
});

/**
 * POST /api/admin/visits/:id/referral
 * Body: { toDoctorName, toSpecialty, toClinic, reason, clinicalSummary, urgency }
 */
exports.addReferral = asyncHandler(async (req, res) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) throw new ApiError(404, 'Visite introuvable');

  const payload = { ...req.body };
  const ref = await Referral.create({
    patientId: visit.patientId,
    fromDoctorId: visit.doctorId,
    visitId: visit._id,
    branchId: visit.branchId,
    ...payload,
    issuedAt: new Date(),
  });

  visit.referralIds.push(ref._id);
  await visit.save();

  res.status(201).json({ success: true, data: ref });
});