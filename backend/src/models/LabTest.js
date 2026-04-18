const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },

    tests: [
      {
        name: { type: String, required: true }, // "CBC", "Glucose"
        code: String,
        notes: String,
      },
    ],

    status: {
      type: String,
      enum: ['requested', 'collected', 'processing', 'completed', 'cancelled'],
      default: 'requested',
    },

    // Results
    resultText: String,
    resultFileUrl: String, // uploaded PDF/image
    resultEnteredAt: Date,

    notes: String,
    requestedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabTest', labTestSchema);
