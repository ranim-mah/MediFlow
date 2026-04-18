const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'card', 'transfer', 'insurance', 'other'], default: 'cash' },
  reference: String,
  paidAt: { type: Date, default: Date.now },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true, required: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },

    items: [invoiceItemSchema],

    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    payments: [paymentSchema],
    amountPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['draft', 'pending', 'partial', 'paid', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },

    currency: { type: String, default: 'EGP' },
    notes: String,
    dueDate: Date,

    // Commission tracking
    primaryStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    commissionAmount: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

invoiceSchema.index({ branchId: 1, createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
