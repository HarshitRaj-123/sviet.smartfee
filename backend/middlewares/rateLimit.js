const rateLimit = require('express-rate-limit');

const paymentRequests = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        success: false,
        message: 'Too many payment requests, please try again later'
    }
});

module.exports = {
    paymentRequests
};