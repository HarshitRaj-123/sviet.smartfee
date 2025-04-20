const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  notificationType: {
    type: String,
    enum: [
      'PAYMENT_SUCCESS',
      'PAYMENT_DUE',
      'CHEQUE_BOUNCE',
      'FINE_IMPOSED',
      'DEADLINE_REMINDER',
      'CUSTOM'
    ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    amount: Number,
    dueDate: Date,
    fineAmount: Number,
    chequeNumber: String,
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    deadlineDate: Date
  },
  priority: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM'
  },
  channels: [{
    type: String,
    enum: ['SMS', 'EMAIL', 'PUSH', 'WHATSAPP'],
    default: ['SMS']
  }],
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'FAILED', 'CANCELLED'],
    default: 'PENDING'
  },
  sendAttempts: {
    type: Number,
    default: 0,
    max: 5
  },
  sentAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ student: 1, notificationType: 1, createdAt: -1 });
notificationSchema.index({ status: 1, sendAttempts: 1 });

// Pre-save middleware to set default message based on notification type
notificationSchema.pre('save', function(next) {
  if (!this.message) {
    switch (this.notificationType) {
      case 'PAYMENT_SUCCESS':
        this.message = `Payment of ₹${this.metadata.amount} received successfully.`;
        break;
      case 'PAYMENT_DUE':
        this.message = `Fee payment of ₹${this.metadata.amount} is due on ${this.metadata.dueDate}.`;
        break;
      case 'CHEQUE_BOUNCE':
        this.message = `Your cheque ${this.metadata.chequeNumber} has bounced. Please arrange alternative payment.`;
        break;
      case 'FINE_IMPOSED':
        this.message = `Fine of ₹${this.metadata.fineAmount} has been imposed on your account.`;
        break;
      case 'DEADLINE_REMINDER':
        this.message = `Reminder: Fee payment deadline is approaching on ${this.metadata.deadlineDate}.`;
        break;
    }
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);