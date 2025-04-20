const Student = require('../models/Student');
// const Institute = require('../models/Institute');
const mongoose = require('mongoose');
const { sendEmail, sendWhatsAppMessage } = require('../services/EmailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Add this middleware at the top
const noCacheHeaders = (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
};






  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'NODE_ENV',
    'DOMAIN'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingEnvVars.length) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

// Constants
const CONSTANTS = {
    PAGINATION: {
      DEFAULT_LIMIT: 10,
      MAX_LIMIT: 100
    },
    FEE_STATUS: {
      PAID: 'Paid',
      PENDING: 'Pending',
      OVERDUE: 'Overdue'
    },
    PAYMENT_MODES: {
      ONLINE: 'Online',
      CASH: 'Cash',
      CHEQUE: 'Cheque'
    },
    ACADEMIC_YEARS: {
      FIRST: 'First Year',
      SECOND: 'Second Year',
      THIRD: 'Third Year',
      FOURTH: 'Fourth Year'
    }
  };
  
  const JWT_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600000,
    domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost'
  };
  
  // Validation helpers
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);
  const sanitizeRollNo = (rollNo) => rollNo.replace(/[^\w-]/g, '');
  
  const validateRequiredFields = (body, fields) => {
    const missingFields = fields.filter(field => !body[field]);
    return missingFields.length ? missingFields : null;
  };
  
  const validateStudentInput = (data) => {
    const errors = [];
    
    if (!data.studentName?.trim()) errors.push('Student name is required');
    if (!data.rollNo?.trim()) errors.push('Roll number is required');
    if (!validateEmail(data.email)) errors.push('Invalid email format');
    if (!validatePhone(data.phone)) errors.push('Invalid phone format');
    
    return errors;
  };
  
  // Response formatters
  const formatStudentResponse = (student) => ({
    success: true,
    data: {
      id: student._id,
      basic: {
        name: student.studentName,
        rollNo: student.rollNo,
        course: student.course,
        academicYear: student.academicYear
      },
      fees: {
        total: student.feeStructure?.totalFee || 0,
        paid: student.totalPayments || 0,
        balance: (student.feeStructure?.totalFee || 0) - (student.totalPayments || 0),
        status: student.feeStatus
      },
      contact: {
        name: student.name,
        email: student.email,
        phone: student.phone
      },
      institute: student.institute
    }
  });
  
  // Error handlers
  const createErrorResponse = (statusCode, message, error = null) => ({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && error && { error: error.stack })
  });
  
  const handleControllerError = (error, res) => {
    console.error('Controller error:', error);
  
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json(createErrorResponse(400, messages.join(', ')));
    }
  
    if (error.code === 11000) {
      return res.status(409).json(createErrorResponse(409, 'Duplicate entry - student already exists'));
    }
  
    return res.status(500).json(createErrorResponse(500, 'Internal server error', error));
  };
  
  // Controller methods
  exports.addStudent = async (req, res) => {
    try {
      const validationErrors = validateStudentInput(req.body);
      if (validationErrors.length) {
        return res.status(400).json(createErrorResponse(400, validationErrors.join(', ')));
      }
  
      if (!mongoose.Types.ObjectId.isValid(req.body.institute)) {
        return res.status(400).json(createErrorResponse(400, 'Invalid Institute ID format'));
      }
  
      const institute = await Institute.findById(req.body.institute);
      if (!institute) {
        return res.status(404).json(createErrorResponse(404, 'Institute not found'));
      }
  
      const existingStudent = await Student.findOne({
        rollNo: { $regex: new RegExp(`^${req.body.rollNo}$`, 'i') },
        institute: req.body.institute
      });
  
      if (existingStudent) {
        return res.status(409).json(createErrorResponse(409, 'Student already exists'));
      }
  
      const newStudent = await Student.create(req.body);
  
      await sendEmail({
        to: req.body.email,
        subject: 'Welcome to Our Institution',
        template: 'welcome',
        data: {
          studentName: req.body.studentName,
          instituteName: institute.name
        }
      });
  
      res.status(201).json(formatStudentResponse(newStudent));
  
    } catch (error) {
      handleControllerError(error, res);
    }
  };
  

 
  

  exports.getStudentById = [noCacheHeaders, async (req, res, next) => {
    try {
      const student = await Student.findById(req.params.id)
        .populate('institute', 'name -_id');
  
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }
  
      res.status(200).json({
        success: true,
        data: student
      });
  
    } catch (error) {
      next(error);
    }
  }];

exports.updateFeeStructure = async (req, res, next) => {
    try {
        const { tuitionFee, hostelFee, miscFee, totalFee, extraFees } = req.body;

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    'feeStructure.tuitionFee': tuitionFee,
                    'feeStructure.hostelFee': hostelFee,
                    'feeStructure.miscFee': miscFee,
                    'feeStructure.totalFee': totalFee,
                    'feeStructure.extraFees': extraFees
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedStudent
        });

    } catch (error) {
        next(error);
    }
};

exports.saveInstallments = async (req, res, next) => {
    try {
        const { installments } = req.body;

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { installments },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updatedStudent
        });

    } catch (error) {
        next(error);
    }
};

// In studentController.js - getStudentsByInstituteId
// Get students by institute ID - Updated Version


exports.getStudentsByInstituteId = async (req, res) => {
    try {
        // Validate institute ID format
        if (!mongoose.Types.ObjectId.isValid(req.params.instituteId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid institute ID format'
            });
        }

        const instituteId = new mongoose.Types.ObjectId(req.params.instituteId);

        // Verify connection state
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection not ready');
        }

        const students = await Student.find({ institute: instituteId })
            .select('studentName rollNo degree academicYear feeStatus installments')
            .maxTimeMS(30000) // 30-second timeout
            .lean();

        if (!students.length) {
            return res.status(404).json({
                success: false,
                message: 'No students found for this institute'
            });
        }

        // Add payment status calculation
        const studentsWithStatus = students.map(student => ({
            ...student,
            paymentStatus: student.installments.some(i => !i.paid) ?
                'Unpaid' : 'Paid'
        }));

        res.status(200).json({
            success: true,
            count: studentsWithStatus.length,
            data: studentsWithStatus
        });

    } catch (error) {
        console.error('Controller error:', error);

        // Specific error handling
        const statusCode = error instanceof mongoose.Error ? 500 : 400;
        const message = error.name === 'CastError' ?
            'Invalid ID format' : error.message;

        res.status(statusCode).json({
            success: false,
            message: `Student fetch failed: ${message}`
        });
    }
};



exports.getFeeDetails = [noCacheHeaders,async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id)
            .select('feeStructure -_id');

        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            data: student.feeStructure
        });

    } catch (error) {
        next(error);
    }
}];



exports.getStudents = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            degree,       // Degree filter
            status,       // Fee status filter (Pending, Paid, Overdue)
            academicYear  // Academic year filter
        } = req.query;

        // Build the query object
        const query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { studentName: { $regex: search, $options: 'i' } }, // Search by name
                { rollNo: { $regex: search, $options: 'i' } },       // Search by roll number
                { email: { $regex: search, $options: 'i' } } // Search by email
            ];
        }

        // Degree filter
        if (degree) {
            query.degree = degree;
        }

        // Academic year filter
        if (academicYear) {
            // Normalize academicYear values
            const academicYearMap = {
                '1st Year': 'First Year',
                '2nd Year': 'Second Year',
                '3rd Year': 'Third Year',
                '4th Year': 'Fourth Year'
            };
            query.academicYear = academicYearMap[academicYear] || academicYear;
        }


        // Fee status filter
        if (status) {
            query.feeStatus = status; // Ensure this matches the field in your Student schema
        }

        // Fetch students with pagination
        const students = await Student.find(query)
            .skip((page - 1) * limit) // Skip records for pagination
            .limit(limit)             // Limit the number of records per page
            .populate('institute', 'name') // Populate institute details (if needed)
            .lean(); // Convert Mongoose documents to plain JavaScript objects

        // Get total count for pagination
        const totalCount = await Student.countDocuments(query);

        // Send response
        res.status(200).json({
            success: true,
            data: {
                students,
                totalCount,
                totalPages: Math.ceil(totalCount / limit), // Calculate total pages
                currentPage: Number(page)                // Current page number
            }
        });

    } catch (error) {
        next(error); // Pass errors to the error-handling middleware
    }
};

// @desc    Get student by roll number
// @route   GET /api/students/roll/:rollNo
// @access  Public
exports.getStudentByRollNo = async (req, res, next) => {
    try {
        // Validate input
        const { rollNo } = req.params;

        if (!rollNo || rollNo.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Roll number is required'
            });
        }

        // Sanitize input - allow only alphanumeric and hyphens/underscores
        const sanitizedRollNo = rollNo.replace(/[^\w-]/g, '');

        // Find student with case-insensitive search
        const student = await Student.findOne({
            rollNo: { $regex: new RegExp(`^${sanitizedRollNo}$`, 'i') }
        })
            .populate('institute', 'name code address')
            .select('-__v -createdAt -updatedAt');

        if (!student) {
            return res.status(404).json({
                success: false,
                error: `Student with roll number ${sanitizedRollNo} not found`
            });
        }

        // Format response
        const response = {
            success: true,
            data: {
                id: student._id,
                rollNo: student.rollNo,
                studentName: student.studentName,
                course: student.course,
                academicYear: student.academicYear,
                feeStatus: student.feeStatus,
                institute: student.institute,
                contact: {
                    name: student.name,
                    phone: student.phone,
                    email: student.email
                }
            }
        };

        res.status(200).json(response);

    } catch (error) {
        // Handle specific MongoDB errors
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid roll number format'
            });
        }

        // Pass other errors to error handler
        next(error);
    }
};


const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
      success: false,
      message: 'Too many login attempts, please try again later'
    }
  });

exports.login = [loginLimiter,async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await Student.findOne({ email }).select('+password');
        const fakeHash = await bcrypt.hash('dummy', 10);
        const isMatch = user
            ? await bcrypt.compare(password, user.password)
            : await bcrypt.compare(password, fakeHash);

        if (!user || !isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 3600000,
            domain: 'localhost'
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        });

        req.session.user = {
            id: user.id,
            role: user.role,
            lastLogin: new Date()
          };
          await req.session.save();

    } catch (err) {
        handleControllerError(err, res);
    }
}];

exports.logout = (req, res) => {
    res.clearCookie('jwt', {
        domain: 'localhost',
        path: '/',
        httpOnly: true
    });

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};


// Helper method for processing payments
// Helper method for processing payments
const processPayment = async (student, paymentData, userId) => {
    const payment = {
      ...paymentData,
      recordedBy: userId,
      paymentDate: new Date(),
      status: 'completed'
    };
  
    student.payments.push(payment);
    student.totalPayments += payment.payableAmount;
    student.balance = student.feeStructure.totalFee - student.totalPayments;
    student.feeStatus = student.balance <= 0 ? CONSTANTS.FEE_STATUS.PAID : CONSTANTS.FEE_STATUS.PENDING;
  
    return student.save();
  };
  
 // Add this validation helper
const validatePaymentInput = (paymentData) => {
    const errors = [];
    
    if (!paymentData.payableAmount || isNaN(paymentData.payableAmount)) {
      errors.push('Valid payment amount is required');
    }
    
    if (!Object.values(CONSTANTS.PAYMENT_MODES).includes(paymentData.paymentMode)) {
      errors.push('Invalid payment mode');
    }
    
    if (paymentData.paymentMode === CONSTANTS.PAYMENT_MODES.ONLINE && !paymentData.transactionId) {
      errors.push('Transaction ID is required for online payments');
    }
    
    return errors;
  };
  
  // Update the addPaymentToStudent method
  exports.addPaymentToStudent = async (req, res) => {
    try {
      const { rollNo } = req.params;
      const paymentData = req.body;
  
      // Validate payment input
      const validationErrors = validatePaymentInput(paymentData);
      if (validationErrors.length) {
        return res.status(400).json(createErrorResponse(400, validationErrors.join(', ')));
      }
  
      const student = await Student.findOne({ rollNo });
      if (!student) {
        return res.status(404).json(createErrorResponse(404, 'Student not found'));
      }
  
      // Check if payment amount exceeds pending balance
      const pendingBalance = student.feeStructure.totalFee - student.totalPayments;
      if (paymentData.payableAmount > pendingBalance) {
        return res.status(400).json(createErrorResponse(400, 'Payment amount exceeds pending balance'));
      }
  
      const updatedStudent = await processPayment(student, paymentData, req.user._id);
      res.status(200).json(formatStudentResponse(updatedStudent));
  
    } catch (error) {
      handleControllerError(error, res);
    }
  };
  