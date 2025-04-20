const validatePaymentLink = (req, res, next) => {
    const { amount, email, phone } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment amount'
        });
    }
    
    if (!email || !phone) {
        return res.status(400).json({
            success: false,
            message: 'Email and phone are required'
        });
    }
    
    next();
};

const validatePayment = (req, res, next) => {
    const { amount, paymentMethod, studentId } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid payment amount'
        });
    }
    
    if (!paymentMethod || !studentId) {
        return res.status(400).json({
            success: false,
            message: 'Payment method and student ID are required'
        });
    }
    
    next();
};

module.exports = {
    validatePaymentLink,
    validatePayment
};