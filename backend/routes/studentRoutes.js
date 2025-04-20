const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middlewares/auth');

// Define roles for better maintainability
const ROLES = {
  SUPER_ADMIN: 'super-admin',
  INSTITUTE_ADMIN: 'institute-admin',
  ACCOUNTANT: 'accountant',
  ADMIN: 'admin'
};

// Basic CRUD Routes
router.post('/', 
  protect, 
  authorize([ROLES.INSTITUTE_ADMIN, ROLES.SUPER_ADMIN]), 
  studentController.addStudent
);

router.get('/getStudents', protect, studentController.getStudents);
router.get('/:id', protect, studentController.getStudentById);

// Roll Number Based Routes (placed before ID routes to prevent conflicts)
router.get('/roll/:rollNo', protect, studentController.getStudentByRollNo);

// Institute Specific Routes
router.get('/institute/:instituteId', 
  protect, 
  authorize([ROLES.INSTITUTE_ADMIN, ROLES.SUPER_ADMIN]),
  studentController.getStudentsByInstituteId
);

// Fee Management Routes
router.get('/:id/fees', protect, studentController.getFeeDetails);
router.put('/:id/fees', 
  protect, 
  authorize([ROLES.ACCOUNTANT, ROLES.ADMIN]),
  studentController.updateFeeStructure
);

// Installment Routes
router.post('/:id/installments', 
  protect,
  authorize([ROLES.ACCOUNTANT, ROLES.ADMIN]), 
  studentController.saveInstallments
);

// Payment Routes
router.put('/:rollNo/payments',
  protect,
  authorize([ROLES.ACCOUNTANT, ROLES.ADMIN]),
  async (req, res) => {
    try {
      const { rollNo } = req.params;
      const paymentData = validateAndPreprocessPayment(req.body);
      
      if (paymentData.errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: paymentData.errors
        });
      }

      const updatedStudent = await processPayment(rollNo, paymentData, req.user._id);
      
      if (!updatedStudent) {
        return res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        });
      }

      const responseData = formatPaymentResponse(updatedStudent, paymentData);
      res.status(200).json(responseData);

    } catch (err) {
      handlePaymentError(err, res);
    }
  }
);

// Helper Functions
const validateAndPreprocessPayment = (paymentData) => {
  const errors = [];
  
  if (paymentData.paymentMode === 'Online' && !paymentData.bankName?.trim()) {
    errors.push('Bank name is required for online payments');
  }

  if (!paymentData.payableAmount || isNaN(paymentData.payableAmount) || paymentData.payableAmount <= 0) {
    errors.push('Valid positive amount is required');
  }

  if (!paymentData.referenceDate || isNaN(new Date(paymentData.referenceDate))) {
    errors.push('Valid reference date required');
  }

  return {
    errors,
    data: {
      ...paymentData,
      payableAmount: Number(paymentData.payableAmount),
      referenceDate: new Date(paymentData.referenceDate),
      paymentDate: new Date()
    }
  };
};

const processPayment = async (rollNo, paymentData, userId) => {
  return await Student.findOneAndUpdate(
    { rollNo },
    { 
      $push: { payments: { ...paymentData.data, recordedBy: userId } },
      $inc: { totalPayments: paymentData.data.payableAmount }
    },
    { 
      new: true,
      runValidators: true,
      projection: {
        studentName: 1,
        rollNo: 1,
        course: 1,
        academicYear: 1,
        feeStructure: 1,
        payments: { $slice: -1 },
        totalPayments: 1,
        balance: 1
      }
    }
  ).lean();
};

const formatPaymentResponse = (student, paymentData) => {
  const currentBalance = student.feeStructure.totalFee - student.totalPayments;
  
  return {
    success: true,
    data: {
      student: {
        id: student._id,
        name: student.studentName,
        rollNo: student.rollNo,
        balance: currentBalance
      },
      payment: {
        id: student.payments[0]._id,
        amount: paymentData.data.payableAmount,
        date: paymentData.data.paymentDate,
        mode: paymentData.data.paymentMode
      }
    },
    message: 'Payment recorded successfully'
  };
};

const handlePaymentError = (err, res) => {
  const statusCode = err.name === 'ValidationError' ? 400 : 500;
  res.status(statusCode).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' 
      ? 'Payment processing error' 
      : err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = router;