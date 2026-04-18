const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema(
  {
    // One queue entry per appointment per day
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },

    queueDate: { type: Date, required: true, index: true }, // YYYY-MM-DD at 00:00
    queueNumber: { type: Number, required: true }, // رقمك

    status: {
      type: String,
      enum: ['waiting', 'called', 'in_session', 'completed', 'skipped', 'cancelled'],
      default: 'waiting',
      index: true,
    },

    checkedInAt: Date,
    calledAt: Date,
    startedAt: Date,
    completedAt: Date,

    // Derived for UI (أمامك، الجاري الآن)
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

queueSchema.index({ branchId: 1, queueDate: 1, doctorId: 1, queueNumber: 1 });

module.exports = mongoose.model('Queue', queueSchema);
