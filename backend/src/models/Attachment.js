const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', index: true },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },

    fileName: { type: String, required: true },
    originalName: String,
    mimeType: String,
    size: Number,
    url: { type: String, required: true },
    storage: { type: String, enum: ['local', 's3', 'cloudinary'], default: 'local' },

    category: {
      type: String,
      enum: ['lab_result', 'radiology_image', 'prescription', 'id_document', 'insurance', 'other'],
      default: 'other',
    },

    description: String,

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attachment', attachmentSchema);
