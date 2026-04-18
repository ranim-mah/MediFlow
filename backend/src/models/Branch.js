const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // الفرع الرئيسي
    code: { type: String, unique: true, sparse: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    workingHours: { type: String, trim: true }, // "9h-17h"
    isMain: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);
