const jwt = require('jsonwebtoken');
const User = require('../models/Users');

// Optimized role hierarchy with clear permissions
const ROLE_HIERARCHY = {
//   'super-admin': new Set(['super-admin', 'sub-super-admin', 'institute-admin', 'accountant', 'parents']),
//   'sub-super-admin': new Set(['sub-super-admin', 'institute-admin', 'accountant', 'parents']),
  'admin': new Set(['admin', 'accountant', 'parents']),
  'accountant': new Set(['accountant', 'parents']),
  'parents': new Set(['parents'])
};

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000 // 15 minutes
};

// Enhanced JWT verification with multiple fallbacks
exports.protect = async (req, res, next) => {
  let token;
  
  // Check multiple token sources
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No token found in headers or cookies.'
    });
  }

  try {
    // Verify token with multiple safeguards
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      clockTolerance: 15,
      ignoreExpiration: false
    });

    // Fetch user with cache considerations
    const user = await User.findById(decoded.id)
      .select('+active +lastLogin')
      .populate('institution', 'name domain')
      .cache({ key: `user:${decoded.id}` });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or disabled'
      });
    }

    // Security audit trail
    req.user = {
      id: user.id,
      role: user.role,
      institution: user.institution,
      permissions: user.permissions,
      lastLogin: user.lastLogin
    };

    // Update login tracking
    if (Date.now() - user.lastLogin.getTime() > 300000) { // 5 minutes
      await User.findByIdAndUpdate(user.id, { lastLogin: new Date() });
    }

    next();
  } catch (error) {
    // Comprehensive error handling
    const errorMap = {
      TokenExpiredError: {
        status: 401,
        message: 'Session expired. Please reauthenticate.'
      },
      JsonWebTokenError: {
        status: 401,
        message: 'Invalid token structure'
      },
      NotBeforeError: {
        status: 401,
        message: 'Token not yet valid'
      },
      default: {
        status: 500,
        message: 'Authentication system error'
      }
    };

    const { status, message } = errorMap[error.name] || errorMap.default;
    res.status(status).json({ 
      success: false,
      message,
      systemNote: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Granular authorization system
exports.authorize = (requiredRoles = []) => {
  if (!Array.isArray(requiredRoles)) {
    throw new Error('Authorization roles must be an array');
  }

  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole || !ROLE_HIERARCHY[userRole]) {
        return res.status(403).json({
          success: false,
          message: 'Invalid user role configuration'
        });
      }

      const hasAccess = requiredRoles.some(role => 
        ROLE_HIERARCHY[userRole].has(role)
      );

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          requiredRoles,
          currentRole: userRole,
          message: `Insufficient privileges. Required roles: ${requiredRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Authorization system failure'
      });
    }
  };
};

// Token generation service
exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      institution: user.institution?.id
    },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      issuer: process.env.JWT_ISSUER || 'your-app-name'
    }
  );
};

// Secure cookie setter
exports.setAuthCookie = (res, token) => {
  res.cookie('jwt', token, COOKIE_CONFIG);
};