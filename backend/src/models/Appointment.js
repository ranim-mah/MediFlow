const mongoose = require('mongoose');
const { APPOINTMENT_STATUS } = require('../utils/constants');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

    // Scheduling
    scheduledAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 30 },

    // Status
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING,
      index: true,
    },

    // Source
    source: {
      type: String,
      enum: ['public_site', 'patient_portal', 'admin', 'phone', 'walk_in', 'whatsapp'],
      default: 'admin',
    },

    // Patient-provided info at booking time
    guestName: String,
    guestPhone: String,
    guestEmail: String,

    // Notes
    notes: String,
    internalNotes: String, // staff-only

    // Queue / turn management (الدور)
    queueNumber: Number,
    checkedInAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelReason: String,

    // Link to resulting visit (when consultation happens)
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

appointmentSchema.index({ branchId: 1, scheduledAt: 1, status: 1 });
appointmentSchema.index({ doctorId: 1, scheduledAt: 1 });
appointmentSchema.index({ patientId: 1, scheduledAt: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
