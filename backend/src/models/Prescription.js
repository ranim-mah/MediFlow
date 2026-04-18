const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: String,          // "500 mg"
  frequency: String,       // "3 fois/jour"
  duration: String,        // "7 jours"
  instructions: String,    // "après les repas"
  quantity: Number,
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },

    medications: [medicationSchema],
    notes: String,

    issuedAt: { type: Date, default: Date.now, index: true },

    // PDF URL (after generation)
    pdfUrl: String,

    // Smart prescription (روشتة ذكية ونبيه تعارض المواد الفعالة)
    interactionWarnings: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
