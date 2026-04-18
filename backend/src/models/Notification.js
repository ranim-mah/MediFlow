const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    type: {
      type: String,
      enum: [
        'appointment_created',
        'appointment_reminder',
        'appointment_cancelled',
        'appointment_modified',
        'prescription_ready',
        'lab_result_ready',
        'radiology_result_ready',
        'invoice_created',
        'payment_received',
        'queue_update',
        'system',
      ],
      required: true,
    },

    title: { type: String, required: true },
    body: String,

    // Deep link inside the app
    link: String,
    linkParams: mongoose.Schema.Types.Mixed,

    // Related entities
    relatedId: mongoose.Schema.Types.ObjectId,
    relatedType: String, // 'Appointment', 'Prescription'...

    // Delivery channels
    channels: [{ type: String, enum: ['in_app', 'push', 'email', 'sms', 'whatsapp'] }],

    // Status
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,

    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
