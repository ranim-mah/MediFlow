const mongoose = require('mongoose');
const { ROLES } = require('../utils/constants');

const staffSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    jobTitle: { type: String, trim: true }, // "طبيب مساعد", "ممرضة", "استقبال"
    role: {
      type: String,
      enum: [ROLES.ASSISTANT, ROLES.RECEPTION, ROLES.NURSE],
      required: true,
    },

    branchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],

    // Commission
    commissionType: { type: String, enum: ['percent', 'fixed', 'none'], default: 'none' },
    commissionValue: { type: Number, default: 0 },

    salary: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema);
