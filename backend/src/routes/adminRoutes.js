const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const { Branch, Service, Doctor } = require('../models');
const { asyncHandler } = require('../utils/asyncHandler');

const dashboard = require('../controllers/adminDashboardController');
const patients = require('../controllers/adminPatientController');

const router = express.Router();

// Staff-only guard for all admin routes
const staffRoles = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.ASSISTANT, ROLES.RECEPTION, ROLES.NURSE];
router.use(protect, authorize(...staffRoles));

// Dashboard
router.get('/dashboard', dashboard.getDashboard);

// Patients
router.get('/patients', patients.listPatients);
router.post('/patients', authorize(ROLES.ADMIN, ROLES.RECEPTION, ROLES.ASSISTANT), patients.createPatient);
router.get('/patients/:id', patients.getPatient);
router.patch('/patients/:id', authorize(ROLES.ADMIN, ROLES.RECEPTION, ROLES.ASSISTANT, ROLES.DOCTOR), patients.updatePatient);
router.delete('/patients/:id', authorize(ROLES.ADMIN), patients.deletePatient);

// Small reference lookups used across the admin UI
router.get('/branches', asyncHandler(async (req, res) => {
  const data = await Branch.find({ isActive: true }).sort({ isMain: -1, name: 1 });
  res.json({ success: true, data });
}));

router.get('/services', asyncHandler(async (req, res) => {
  const data = await Service.find({ isActive: true }).sort({ createdAt: 1 });
  res.json({ success: true, data });
}));

router.get('/doctors', asyncHandler(async (req, res) => {
  const data = await Doctor.find({ isActive: true })
    .populate('userId', 'fullName email phone')
    .populate('serviceIds', 'name');
  res.json({ success: true, data });
}));

module.exports = router;