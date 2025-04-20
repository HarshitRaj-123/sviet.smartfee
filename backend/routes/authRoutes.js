const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { login, logout, getMe, updatePassword } = require('../controllers/authController');
const { loginLimiter } = require('../middlewares/loginLimiter');

// Define roles constant for consistency
const ROLES = {
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  STUDENT: 'student'
};

// Public routes
router.post('/login', loginLimiter, login);
router.post('/logout', logout);

// Protected routes accessible by all authenticated users
router.use(protect); // Apply protection to all routes below

router.get('/me', getMe);
router.patch('/update-password', updatePassword);

// Admin routes
router.use('/admin', authorize([ROLES.ADMIN]));
router.get('/admin/dashboard', (req, res) => {
  res.json({ message: 'Admin Dashboard' });
});
router.get('/admin/users', (req, res) => {
  res.json({ message: 'User Management' });
});
router.get('/admin/reports', (req, res) => {
  res.json({ message: 'Admin Reports' });
});

// Accountant routes
router.use('/accountant', authorize([ROLES.ACCOUNTANT]));
router.get('/accountant/dashboard', (req, res) => {
  res.json({ message: 'Accountant Dashboard' });
});
router.get('/accountant/fees', (req, res) => {
  res.json({ message: 'Fee Management' });
});
router.get('/accountant/reports', (req, res) => {
  res.json({ message: 'Financial Reports' });
});

// student routes
router.use('/student', authorize([ROLES.STUDENT]));
router.get('/student/dashboard', (req, res) => {
  res.json({ message: 'student Dashboard' });
});
router.get('/student/payments', (req, res) => {
  res.json({ message: 'Payment Management' });
});
router.get('/student/student-records', (req, res) => {
  res.json({ message: 'Student Records' });
});

// Error handling middleware
router.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

module.exports = router;