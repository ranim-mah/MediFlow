const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userRole: String,
    action: { type: String, required: true }, // 'create', 'update', 'delete', 'login', 'logout'
    entity: String, // 'Patient', 'Appointment'...
    entityId: mongoose.Schema.Types.ObjectId,
    changes: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
