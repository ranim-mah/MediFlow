const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ALL_ROLES, ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    // Identification
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // allows multiple null values
      unique: true,
    },
    phone: { type: String, trim: true, sparse: true, unique: true },
    password: { type: String, required: true, minlength: 6, select: false },

    // Role & access
    role: { type: String, enum: ALL_ROLES, default: ROLES.PATIENT, required: true },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },

    // Profile
    avatar: { type: String, default: null },
    preferredLanguage: { type: String, enum: ['ar', 'fr', 'en'], default: 'ar' },

    // Multi-tenant (future-proof for multiple clinics)
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },

    // Refresh tokens (for multi-device support)
    refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],

    // Tracking
    lastLoginAt: Date,
    lastLoginIp: String,
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Remove sensitive fields in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.__v;
  return obj;
};

// Validation: must have at least email or phone
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    return next(new Error('User must have either email or phone'));
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
