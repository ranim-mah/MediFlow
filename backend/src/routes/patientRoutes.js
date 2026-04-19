const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');
const c = require('../controllers/patientController');

const router = express.Router();

// All routes protected and patient-only
router.use(protect, authorize(ROLES.PATIENT));

router.get('/me', c.getDashboard);

router.get('/appointments', c.listAppointments);
router.post('/appointments', c.createAppointment);
router.patch('/appointments/:id/cancel', c.cancelAppointment);

router.get('/medical-file', c.getMedicalFile);
router.get('/timeline', c.getTimeline);
router.get('/queue', c.getQueue);

router.get('/notifications', c.listNotifications);
router.patch('/notifications/read-all', c.markAllNotificationsRead);
router.patch('/notifications/:id/read', c.markNotificationRead);

module.exports = router;
