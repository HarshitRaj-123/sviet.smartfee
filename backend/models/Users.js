const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = {
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  PARENT: 'parent'
};

const PERMISSIONS = {
  VIEW_DASHBOARD: 'view-dashboard',
  MANAGE_USERS: 'manage-users',
  MANAGE_STUDENTS: 'manage-students',
  MANAGE_FEES: 'manage-fees',
  VIEW_REPORTS: 'view-reports',
  VIEW_STUDENT_RECORDS: 'view-student-records',
  MAKE_PAYMENTS: 'make-payments'
};

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    // unique: true,
    trim: true,
  },
  email: { 
    type: String,
    required: [true, 'Email is required'],
    // unique: true,
    lowercase: true,
    trim: true,
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  roleNumber: { 
    type: String, 
    trim: true,
    unique: true
  },
  institute: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Institute',
    required: function() {
      return [ROLES.ADMIN, ROLES.ACCOUNTANT].includes(this.role);
    } 
  },
  permissions: {
    type: [String],
    enum: Object.values(PERMISSIONS),
    default: function() {
      switch(this.role) {
        case ROLES.ADMIN:
          return [
            PERMISSIONS.VIEW_DASHBOARD,
            PERMISSIONS.MANAGE_USERS,
            PERMISSIONS.MANAGE_STUDENTS,
            PERMISSIONS.MANAGE_FEES,
            PERMISSIONS.VIEW_REPORTS
          ];
        case ROLES.ACCOUNTANT:
          return [
            PERMISSIONS.VIEW_DASHBOARD,
            PERMISSIONS.MANAGE_FEES,
            PERMISSIONS.VIEW_REPORTS
          ];
        case ROLES.PARENT:
          return [
            PERMISSIONS.VIEW_STUDENT_RECORDS,
            PERMISSIONS.MAKE_PAYMENTS
          ];
        default:
          return [];
      }
    }
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: function() {
      return this.role !== ROLES.ADMIN;
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  }
}, {
  timestamps: true,
  // Add index configuration here instead of schema.index()
  indexes: [
    { fields: { email: 1 }, unique: true },
    { fields: { username: 1 }, unique: true },
    { fields: { role: 1 } }
  ]
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
module.exports = User;