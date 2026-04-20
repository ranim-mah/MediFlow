const { nanoid } = require('nanoid');
const {
  Patient, User, Appointment, Visit, Prescription, LabTest,
  Radiology, Procedure, Invoice,
} = require('../models');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');

/**
 * GET /api/admin/patients
 * Query: ?q=search&page=1&limit=20&highRisk=1&chronic=1
 */
exports.listPatients = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20, highRisk, chronic } = req.query;
  const filter = {};

  if (q) {
    filter.$or = [
      { fullName: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { patientCode: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }
  if (highRisk === '1' || highRisk === 'true') filter.isHighRisk = true;
  if (chronic === '1' || chronic === 'true') filter.isChronic = true;

  const skip = (Number(page) - 1) * Number(limit);

  const [patients, total, stats] = await Promise.all([
    Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Patient.countDocuments(filter),
    computePatientStats(),
  ]);

  res.json({
    success: true,
    data: { patients, pagination: { page: Number(page), limit: Number(limit), total }, stats },
  });
});

const computePatientStats = async () => {
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const [total, newThisMonth, atRisk, withBalance] = await Promise.all([
    Patient.countDocuments({}),
    Patient.countDocuments({ createdAt: { $gte: thisMonthStart } }),
    Patient.countDocuments({ $or: [{ isHighRisk: true }, { isChronic: true }] }),
    Patient.countDocuments({ outstandingBalance: { $gt: 0 } }),
  ]);
  return { total, newThisMonth, atRisk, withBalance };
};

/**
 * GET /api/admin/patients/:id
 * Full patient file (for image 11 "ملف المريض الشامل").
 */
exports.getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new ApiError(404, 'Patient introuvable');

  const pid = patient._id;
  const [visits, appointments, prescriptions, labs, radiology, procedures, invoices, lastPrescription, lastLab, lastRadio] = await Promise.all([
    Visit.countDocuments({ patientId: pid }),
    Appointment.countDocuments({ patientId: pid }),
    Prescription.countDocuments({ patientId: pid }),
    LabTest.countDocuments({ patientId: pid }),
    Radiology.countDocuments({ patientId: pid }),
    Procedure.countDocuments({ patientId: pid }),
    Invoice.find({ patientId: pid }).sort({ createdAt: -1 }).limit(10),
    Prescription.findOne({ patientId: pid }).sort({ issuedAt: -1 })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } }),
    LabTest.findOne({ patientId: pid }).sort({ requestedAt: -1 })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'fullName' } }),
    Radiology.findOne({ patientId: pid }).sort({ requestedAt: -1 }),
  ]);

  const totalPaid = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const totalBilled = invoices.reduce((s, i) => s + (i.total || 0), 0);

  res.json({
    success: true,
    data: {
      patient,
      counts: { visits, appointments, prescriptions, labs, radiology, procedures },
      financial: { totalBilled, totalPaid, balance: totalBilled - totalPaid },
      recent: { lastPrescription, lastLab, lastRadiology: lastRadio },
      invoices,
    },
  });
});

/**
 * POST /api/admin/patients
 */
exports.createPatient = asyncHandler(async (req, res) => {
  const { fullName, phone, email, age, gender, bloodType, branchId, nationalId, address, healthSummary, isHighRisk, isChronic } = req.body;

  if (!fullName || !phone) throw new ApiError(400, 'fullName et phone requis');

  const patientCode = `P${Date.now().toString().slice(-6)}${nanoid(3).toUpperCase()}`;

  const patient = await Patient.create({
    patientCode, fullName, phone, email, age, gender, bloodType,
    branchId, nationalId, address, healthSummary,
    isHighRisk: !!isHighRisk, isChronic: !!isChronic,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: patient });
});

/**
 * PATCH /api/admin/patients/:id
 */
exports.updatePatient = asyncHandler(async (req, res) => {
  const allowed = [
    'fullName', 'phone', 'email', 'age', 'gender', 'bloodType', 'nationalId',
    'address', 'healthSummary', 'isHighRisk', 'isChronic', 'flags',
    'allergies', 'chronicConditions', 'currentMedications', 'emergencyContact',
  ];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const patient = await Patient.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!patient) throw new ApiError(404, 'Patient introuvable');

  res.json({ success: true, data: patient });
});

/**
 * DELETE /api/admin/patients/:id
 */
exports.deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) throw new ApiError(404, 'Patient introuvable');
  res.json({ success: true, message: 'Patient supprimé' });
});