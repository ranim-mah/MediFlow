const mongoose = require('mongoose');
const { VISIT_STATUS } = require('../utils/constants');

const visitSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },

    visitDate: { type: Date, default: Date.now, index: true },
    status: {
      type: String,
      enum: Object.values(VISIT_STATUS),
      default: VISIT_STATUS.IN_SESSION,
    },

    // Doctor Focus Mode fields (الشكوى، التشخيص، الخطة، القرار)
    complaint: { type: String, default: '' },      // الشكوى
    diagnosis: { type: String, default: '' },      // التشخيص
    plan: { type: String, default: '' },           // الخطة
    decision: { type: String, default: '' },      // القرار

    // Vital signs (العلامات الحيوية)
    vitals: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      weight: Number,
      height: Number,
      oxygenSaturation: Number,
      respiratoryRate: Number,
    },

    // Physical exam (الكشف الحالي)
    physicalExam: String,

    // Follow-ups (المتابعة)
    followUpNotes: String,
    followUpDate: Date,

    // Linked records
    prescriptionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }],
    labTestIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' }],
    radiologyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Radiology' }],
    procedureIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Procedure' }],
    referralIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Referral' }],
    attachmentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],

    // Session tracking
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    durationMinutes: Number,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

visitSchema.index({ patientId: 1, visitDate: -1 });
visitSchema.index({ doctorId: 1, visitDate: -1 });

module.exports = mongoose.model('Visit', visitSchema);
