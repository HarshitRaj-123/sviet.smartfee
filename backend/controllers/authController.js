const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger');

// Validate environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_EXPIRES_IN', 'NODE_ENV'];
requiredEnvVars.forEach(variable => {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
});

// Login controller with rate limiting and enhanced security
const login = async (req, res) => {
  try {
    const { contactEmail, password } = req.body;

    // Enhanced validation
    if (!contactEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Find user with case-insensitive email match
    const user = await User.findOne({
      contactEmail: { $regex: new RegExp(`^${contactEmail}$`, 'i') }
    }).select('+password');

    // Use constant time comparison to prevent timing attacks
    const fakeHash = await bcrypt.hash('dummy', 10);
    const isMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, fakeHash);

    if (!user || !isMatch) {
      logger.warn(`Failed login attempt for email: ${contactEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Token generation with additional claims
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        institution: user.institution,
        email: user.contactEmail,
        iat: Date.now()
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
        algorithm: 'HS256'
      }
    );

    // Enhanced cookie settings
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost',
      path: '/'
    };

    // Set cookie and session
    res.cookie('jwt', token, cookieOptions);
    req.session.user = {
      id: user.id,
      role: user.role,
      lastLogin: new Date()
    };
    await req.session.save();

    // Remove sensitive data
    user.password = undefined;
    user.__v = undefined;

    // Log successful login
    logger.info(`Successful login for user: ${user.id}`);

    // Send response
    res.status(200).json({
      success: true,
      token,
      data: {
        user: {
          id: user.id,
          contactEmail: user.contactEmail,
          role: user.role,
          name: user.name,
          institution: user.institution
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again later.'
    });
  }
};

// Logout controller
const logout = async (req, res) => {
  try {
      res.clearCookie('jwt');
      req.session.destroy();
      
      res.status(200).json({
          success: true,
          message: 'Logged out successfully'
      });
  } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
          success: false,
          message: 'Error during logout'
      });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select('-password');
      res.status(200).json({
          success: true,
          data: user
      });
  } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({
          success: false,
          message: 'Error fetching user data'
      });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id).select('+password');

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(401).json({
              success: false,
              message: 'Current password is incorrect'
          });
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({
          success: true,
          message: 'Password updated successfully'
      });
  } catch (error) {
      logger.error('Update password error:', error);
      res.status(500).json({
          success: false,
          message: 'Error updating password'
      });
  }
};

// Export all controller functions
module.exports = {
  login,
  logout,
  getMe,
  updatePassword
};