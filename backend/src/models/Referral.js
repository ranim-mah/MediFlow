const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    fromDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },

    // Destination
    toDoctorName: String,      // external doctor
    toSpecialty: String,
    toClinic: String,

    reason: String,
    clinicalSummary: String,
    urgency: { type: String, enum: ['routine', 'urgent', 'emergency'], default: 'routine' },

    pdfUrl: String,

    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Referral', referralSchema);
