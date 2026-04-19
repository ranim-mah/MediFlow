const express = require('express');
const c = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(protect, authorize(ROLES.DOCTOR, ROLES.ADMIN));

router.get('/focus', c.getFocusBoard);
router.get('/appointments', c.listMyAppointments);
router.get('/appointments/:id', c.getAppointmentDetail);
router.patch('/appointments/:id/status', c.updateMyAppointmentStatus);
router.post('/appointments/:id/start-visit', c.startVisit);
router.patch('/visits/:visitId', c.saveVisitNotes);

module.exports = router;
