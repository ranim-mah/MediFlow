const mongoose = require('mongoose');

const procedureSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },

    name: { type: String, required: true }, // "Suture", "Biopsie"
    description: String,
    performedAt: { type: Date, default: Date.now, index: true },

    // Team
    assistantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Outcome
    outcome: String,
    complications: String,
    notes: String,

    // Billing link
    price: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Procedure', procedureSchema);
