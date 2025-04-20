const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

const ROLES = {
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  PARENT: 'parent'
};

// Protected routes - all notification routes require authentication
router.use(protect);

// Get notifications for current user
router.get('/my-notifications', notificationController.getMyNotifications);

// Mark notification as read
router.patch('/mark-read/:id', notificationController.markAsRead);

// Admin only routes
router.use('/admin', authorize([ROLES.ADMIN]));

// Manual trigger for checking installments
router.get('/admin/check-installments', async (req, res) => {
  try {
    const result = await notificationController.checkInstallments();
    res.json({
      success: true,
      notificationsProcessed: result.length,
      notifications: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send custom notification
router.post('/admin/send', notificationController.sendCustomNotification);

// Get all notifications (admin only)
router.get('/admin/all', notificationController.getAllNotifications);

// Accountant routes
router.use('/accountant', authorize([ROLES.ACCOUNTANT]));

// Get fee-related notifications
router.get('/accountant/fee-notifications', notificationController.getFeeNotifications);

// Parent routes
router.use('/parent', authorize([ROLES.PARENT]));

// Get payment reminders
router.get('/parent/payment-reminders', notificationController.getPaymentReminders);

// Error handling middleware
router.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Notification Error'
  });
});

module.exports = router;