// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const AsyncError = require('./utils/AsyncError');
const { logger, requestLogger } = require('./utils/logger');



// Import routes
// const instituteRoutes = require('./routes/instituteRoutes');
const studentRoutes = require('./routes/paymentRoute');
const paymentRoutes = require('./routes/paymentRoute');
const bulkActionRoutes = require('./routes/AddStudentBulk');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandlling');
const { checkInstallments } = require('./controllers/notificationController');



// Create Express app
const app = express();


// Production middleware
if (process.env.NODE_ENV === 'production') {
    app.use(require('compression')());
  }

// Security middleware
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' }
  }));
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // Default 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // Default 100 requests
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Middleware
// Update your CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Add after other middleware but before routes
app.use(requestLogger);


app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Session configuration
// Update your session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost'
    },
    name: 'sessionId' // Change default connect.sid
  }));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
// app.use('/api/v1/institutes', instituteRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/bulk-actions', bulkActionRoutes);
app.use('/api/v1/auth', authRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'API is running!'
    });
  } );
// Wrap async route handlers
app.get('/health', AsyncError(async (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  }));


// Error handling - 404
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

// Global error handler
app.use(errorHandler);

// Process handlers
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥');
    console.error(err.name, err.message);
    process.exit(1);
  });
  
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥');
    console.error(err.name, err.message);
    process.exit(1);
  });

// Initialize database and start server
const startServer = async () => {
    try {
      // Connect to database
      await connectDB();
      
      const PORT = process.env.PORT || 4000;
      const server = app.listen(PORT, () => {
        logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      });
  
      // Graceful shutdown
      process.on('SIGTERM', async () => {
        logger.info('SIGTERM received. Shutting down gracefully');
        await mongoose.connection.close();
        server.close(() => {
          logger.info('Process terminated!');
          process.exit(0);
        });
      });
  
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  };
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    process.exit(1);
  });
  
  // Handle promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    process.exit(1);
  });
  
  startServer();


module.exports = app;