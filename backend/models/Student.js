const mongoose = require("mongoose");
const { Schema } = mongoose;

// Fee Component Schema
const feeComponentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Fee component name is required'],
    trim: true
  },
  feeAmount: {
    type: Number,
    required: [true, 'Fee amount is required'],
    min: [0, 'Fee amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  payableFee: {
    type: Number,
    required: [true, 'Payable fee is required'],
    min: [0, 'Payable fee cannot be negative']
  }
});

// Fee Summary Schema
const feeSummarySchema = new Schema({
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  unpaidAmount: {
    type: Number,
    required: [true, 'Unpaid amount is required'],
    min: [0, 'Unpaid amount cannot be negative']
  }
});

// Installment Schema
const installmentSchema = new Schema({
  date: {
    type: Date,
    required: [true, 'Installment date is required']
  },
  amount: {
    type: Number,
    required: [true, 'Installment amount is required'],
    min: [0, 'Installment amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['paid', 'unpaid'],
      message: '{VALUE} is not a valid status'
    },
    default: 'unpaid'
  }
});

// Student Schema
const studentSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  primaryContact: {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true
    },
    number: {
      type: String,
      required: [true, 'Contact number is required'],
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    }
  },
  institute: {
    type: String,
    required: [true, 'Institute name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: {
      values: ['student'],
      message: '{VALUE} is not a valid role'
    },
    default: 'student',
    required: true
  },
  feeDetails: [feeComponentSchema],
  feeSummary: feeSummarySchema,
  installments: [installmentSchema]
}, {
  timestamps: true
});

// Indexes
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ 'primaryContact.email': 1 });

// Pre-save middleware to calculate feeSummary
studentSchema.pre('save', function(next) {
  if (this.feeDetails && this.feeDetails.length > 0) {
    const totalAmount = this.feeDetails.reduce((sum, fee) => sum + fee.feeAmount, 0);
    const paidAmount = this.feeDetails.reduce((sum, fee) => sum + fee.paidAmount, 0);
    const unpaidAmount = totalAmount - paidAmount;

    this.feeSummary = {
      totalAmount,
      paidAmount,
      unpaidAmount
    };
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;