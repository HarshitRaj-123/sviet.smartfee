const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const paymentController = require('../controllers/paymentController');
const { validatePaymentLink, validatePayment } = require('../middlewares/validatePaymentLink');
const rateLimiter = require('../middlewares/rateLimit');

// Define roles with constants
const ROLES = {
    ADMIN: 'admin',
    ACCOUNTANT: 'accountant',
    PARENT: 'parent',
    STUDENT: 'student'
};

// Protected routes - all payment routes require authentication
router.use(protect);

// Common routes for authenticated users
router.post(
    '/create-payment-link',
    validatePaymentLink,
    rateLimiter.paymentRequests,
    paymentController.createPaymentLink
);
router.get('/payment-history', paymentController.getPaymentHistory);
router.get('/payment-status/:paymentId', paymentController.getPaymentStatus);

// Parent/Student routes
router.use('/student', authorize([ROLES.PARENT, ROLES.STUDENT]));
router.post(
    '/student/make-payment',
    validatePayment,
    rateLimiter.paymentRequests,
    paymentController.makePayment
);
router.get('/student/pending-payments', paymentController.getPendingPayments);
router.get('/student/payment-receipts', paymentController.getPaymentReceipts);
router.get('/student/fee-structure', paymentController.getFeeStructure);

// Accountant routes
router.use('/accountant', authorize([ROLES.ACCOUNTANT, ROLES.ADMIN]));
router.post(
    '/accountant/record-payment',
    validatePayment,
    paymentController.recordPayment
);
router.get('/accountant/daily-collections', paymentController.getDailyCollections);
router.get('/accountant/payment-reports', paymentController.getPaymentReports);
router.get('/accountant/pending-dues', paymentController.getPendingDues);

// Admin routes
router.use('/admin', authorize([ROLES.ADMIN]));
router.get('/admin/all-payments', paymentController.getAllPayments);
router.post(
    '/admin/refund',
    validatePayment,
    paymentController.initiateRefund
);
router.get('/admin/payment-analytics', paymentController.getPaymentAnalytics);
router.put('/admin/update-fee-structure', paymentController.updateFeeStructure);

// Webhook route - should be unprotected but verified by signature
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    paymentController.handleWebhook
);

// Export router
module.exports = router;