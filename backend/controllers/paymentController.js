const RazorpayService = require('../services/RazorpayService');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const { logger } = require('../utils/logger');

// Create payment link
exports.createPaymentLink = async (req, res) => {
    try {
        const { amount, email, phone } = req.body;
        const paymentLink = await RazorpayService.createPaymentLink(amount, email, phone);
        
        res.status(200).json({
            success: true,
            data: paymentLink
        });
    } catch (error) {
        logger.error('Create payment link error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.id })
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        logger.error('Get payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment history'
        });
    }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        logger.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment status'
        });
    }
};

// Make payment
exports.makePayment = async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;
        // Add payment logic here
        res.status(200).json({
            success: true,
            message: 'Payment successful'
        });
    } catch (error) {
        logger.error('Make payment error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get pending payments
exports.getPendingPayments = async (req, res) => {
    try {
        const pendingPayments = await Payment.find({
            user: req.user.id,
            status: 'pending'
        });
        
        res.status(200).json({
            success: true,
            data: pendingPayments
        });
    } catch (error) {
        logger.error('Get pending payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending payments'
        });
    }
};

// Get payment receipts
exports.getPaymentReceipts = async (req, res) => {
    try {
        const receipts = await Payment.find({
            user: req.user.id,
            status: 'completed'
        });
        
        res.status(200).json({
            success: true,
            data: receipts
        });
    } catch (error) {
        logger.error('Get payment receipts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment receipts'
        });
    }
};

// Get fee structure
exports.getFeeStructure = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .select('feeStructure');
            
        res.status(200).json({
            success: true,
            data: student.feeStructure
        });
    } catch (error) {
        logger.error('Get fee structure error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching fee structure'
        });
    }
};

// Record payment (for accountants)
exports.recordPayment = async (req, res) => {
    try {
        const { studentId, amount, paymentMethod } = req.body;
        // Add payment recording logic here
        res.status(200).json({
            success: true,
            message: 'Payment recorded successfully'
        });
    } catch (error) {
        logger.error('Record payment error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get daily collections
exports.getDailyCollections = async (req, res) => {
    try {
        const collections = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: '$createdAt', total: { $sum: '$amount' } } }
        ]);
        
        res.status(200).json({
            success: true,
            data: collections
        });
    } catch (error) {
        logger.error('Get daily collections error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching daily collections'
        });
    }
};

// Get payment reports
exports.getPaymentReports = async (req, res) => {
    try {
        // Add payment report generation logic here
        res.status(200).json({
            success: true,
            data: []
        });
    } catch (error) {
        logger.error('Get payment reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating payment reports'
        });
    }
};

// Get pending dues
exports.getPendingDues = async (req, res) => {
    try {
        // Add pending dues calculation logic here
        res.status(200).json({
            success: true,
            data: []
        });
    } catch (error) {
        logger.error('Get pending dues error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending dues'
        });
    }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
            
        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        logger.error('Get all payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching all payments'
        });
    }
};

// Update fee structure (admin only)
exports.updateFeeStructure = async (req, res) => {
    try {
        // Add fee structure update logic here
        res.status(200).json({
            success: true,
            message: 'Fee structure updated successfully'
        });
    } catch (error) {
        logger.error('Update fee structure error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Handle webhook
exports.handleWebhook = async (req, res) => {
    try {
        // Add webhook handling logic here
        res.status(200).json({ received: true });
    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Initiate refund
exports.initiateRefund = async (req, res) => {
    try {
        // Add refund logic here
        res.status(200).json({
            success: true,
            message: 'Refund initiated successfully'
        });
    } catch (error) {
        logger.error('Initiate refund error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get payment analytics
exports.getPaymentAnalytics = async (req, res) => {
    try {
        // Add analytics calculation logic here
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        logger.error('Get payment analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment analytics'
        });
    }
};