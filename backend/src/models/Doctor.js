const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialty: { type: String, trim: true }, // قلب، أسنان...
    licenseNumber: { type: String, trim: true },
    bio: String,

    // Services this doctor provides
    serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],

    // Branches
    branchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],

    // Commission (تقرير عمولات الموظفين)
    commissionType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    commissionValue: { type: Number, default: 0 },

    // Working schedule (simple weekly template)
    schedule: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sunday
        startTime: String, // "09:00"
        endTime: String,   // "17:00"
        slotDuration: { type: Number, default: 30 }, // minutes
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
