const mongoose = require('mongoose');

const radiologySchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },

    exams: [
      {
        name: { type: String, required: true }, // "X-Ray chest", "MRI knee"
        bodyPart: String,
        notes: String,
      },
    ],

    status: {
      type: String,
      enum: ['requested', 'scheduled', 'completed', 'cancelled'],
      default: 'requested',
    },

    reportText: String,
    reportFileUrl: String,
    imageFileUrls: [String],
    reportEnteredAt: Date,

    notes: String,
    requestedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Radiology', radiologySchema);
