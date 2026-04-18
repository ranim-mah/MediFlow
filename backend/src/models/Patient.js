const mongoose = require('mongoose');
const { GENDER, BLOOD_TYPES } = require('../utils/constants');

const patientSchema = new mongoose.Schema(
  {
    // Link to User account (if patient has portal access)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Clinic-assigned patient code (visible in admin: "كود: 2140")
    patientCode: { type: String, unique: true, required: true, index: true },

    // Identity
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    dateOfBirth: Date,
    age: Number, // computed or entered
    gender: { type: String, enum: Object.values(GENDER) },
    nationalId: { type: String, trim: true, sparse: true },

    // Medical baseline
    bloodType: { type: String, enum: BLOOD_TYPES },
    allergies: [String],
    chronicConditions: [String],
    currentMedications: [String],

    // Quick health summary (الملخص الصحي السريع)
    healthSummary: { type: String, default: '' },

    // Flags
    isHighRisk: { type: Boolean, default: false }, // مرضى عالي الخطورة
    isChronic: { type: Boolean, default: false },  // مزمن
    flags: [String], // e.g. ['حساسية', 'مزمن']

    // Contact
    address: String,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },

    // Stats (denormalized for quick display)
    totalVisits: { type: Number, default: 0 },
    totalPrescriptions: { type: Number, default: 0 },
    totalLabTests: { type: Number, default: 0 },
    totalRadiology: { type: Number, default: 0 },
    totalProcedures: { type: Number, default: 0 },
    lastVisitAt: Date,

    // Financial (denormalized)
    outstandingBalance: { type: Number, default: 0 },

    // Branch
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },

    // Audit
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

patientSchema.index({ fullName: 'text', phone: 'text', patientCode: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
