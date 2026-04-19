const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const c = require('../controllers/adminController');

const router = express.Router();

// Admin clinic scope: can be used by admin and front-desk roles
router.use(
  protect,
  authorize(ROLES.ADMIN, ROLES.RECEPTION, ROLES.ASSISTANT, ROLES.NURSE, ROLES.DOCTOR)
);

router.get('/dashboard', c.getDashboard);
router.get('/appointments', c.listAppointments);
router.get('/patients', c.listPatients);
router.get('/patients/:id', c.getPatientDetails);
router.get('/appointments/calendar', c.getCalendar);
router.patch('/appointments/:id/status', c.updateAppointmentStatus);

module.exports = router;