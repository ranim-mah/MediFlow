const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    // Multilingual name
    name: {
      ar: { type: String, required: true, trim: true }, // كشف طبي عام
      fr: String,
      en: String,
    },
    code: { type: String, unique: true, sparse: true },
    description: {
      ar: String,
      fr: String,
      en: String,
    },
    icon: String, // lucide icon name or emoji
    color: String, // hex

    // Pricing
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'DT' },

    // Duration (minutes)
    defaultDuration: { type: Number, default: 30 },

    // Availability
    isPublic: { type: Boolean, default: true }, // visible on public booking
    isActive: { type: Boolean, default: true },

    // Branch restriction (null = all branches)
    branchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
