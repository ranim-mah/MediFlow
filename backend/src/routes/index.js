const express = require('express');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mediflow API is running',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/public', require('./publicRoutes'));
router.use('/patient', require('./patientRoutes'));
router.use('/admin', require('./adminRoutes'));

// Future routes:
// router.use('/patients', require('./patientRoutes'));
// router.use('/appointments', require('./appointmentRoutes'));
// router.use('/services', require('./serviceRoutes'));
// router.use('/branches', require('./branchRoutes'));

module.exports = router;
