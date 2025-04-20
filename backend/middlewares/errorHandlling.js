const { logger } = require('../utils/logger');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
        path: req.originalUrl
    });

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production error response
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
};

module.exports = errorHandler;