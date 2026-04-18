const { nanoid } = require('nanoid');
const { Service, Branch, Appointment, Patient, User } = require('../models');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { APPOINTMENT_STATUS, ROLES } = require('../utils/constants');

/**
 * GET /api/public/services
 * List services visible on the public site.
 */
exports.listPublicServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ isActive: true, isPublic: true }).sort({ createdAt: 1 });
  res.json({ success: true, data: services });
});

/**
 * GET /api/public/branches
 * List active branches.
 */
exports.listBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find({ isActive: true }).sort({ isMain: -1, name: 1 });
  res.json({ success: true, data: branches });
});

/**
 * POST /api/public/quick-book
 * Guest booking from the public landing page.
 * Body: { fullName, phone, email?, serviceId, branchId, scheduledAt, notes? }
 *
 * Creates (or links) a patient record and a pending appointment.
 * No authentication required.
 */
exports.quickBook = asyncHandler(async (req, res) => {
  const { fullName, phone, email, serviceId, branchId, scheduledAt, notes } = req.body;

  if (!fullName || !phone || !branchId || !scheduledAt) {
    throw new ApiError(400, 'Champs requis : fullName, phone, branchId, scheduledAt');
  }

  const branch = await Branch.findById(branchId);
  if (!branch || !branch.isActive) throw new ApiError(404, 'Succursale introuvable');

  let service = null;
  if (serviceId) {
    service = await Service.findById(serviceId);
    if (!service || !service.isActive) throw new ApiError(404, 'Service introuvable');
  }

  // Try to find existing patient by phone
  let patient = await Patient.findOne({ phone });
  if (!patient) {
    const patientCode = `P${Date.now().toString().slice(-6)}${nanoid(3).toUpperCase()}`;
    patient = await Patient.create({
      patientCode,
      fullName,
      phone,
      email,
      branchId: branch._id,
    });
  }

  const appointment = await Appointment.create({
    patientId: patient._id,
    serviceId: service?._id,
    branchId: branch._id,
    scheduledAt: new Date(scheduledAt),
    durationMinutes: service?.defaultDuration || 30,
    status: APPOINTMENT_STATUS.PENDING,
    source: 'public_site',
    guestName: fullName,
    guestPhone: phone,
    guestEmail: email,
    notes,
  });

  res.status(201).json({
    success: true,
    message: 'Demande de reservation envoyee. La clinique vous contactera pour confirmation.',
    data: {
      appointmentId: appointment._id,
      patientCode: patient.patientCode,
      scheduledAt: appointment.scheduledAt,
      status: appointment.status,
    },
  });
});