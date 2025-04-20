import { ROLES, ROLE_HIERARCHY, PERMISSIONS } from '../config/constants'

export class RoleManager {
  static hasPermission(userRole, requiredRole) {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
  }

  static isAdmin(role) {
    return role === ROLES.ADMIN
  }

  static isAccountant(role) {
    return role === ROLES.ACCOUNTANT
  }

  static isStudent(role) {
    return role === ROLES.STUDENT
  }

  static getHighestRole(roles) {
    return roles.reduce((highest, role) => {
      return ROLE_HIERARCHY[role] > ROLE_HIERARCHY[highest] ? role : highest
    }, roles[0])
  }
  
  /**
   * Check if a user has a specific permission
   * @param {string} role - The user's role
   * @param {string} section - The permission section (e.g., 'dashboard', 'users', 'fee_management')
   * @param {string} action - The specific permission action to check
   * @param {string|null} subsection - Optional subsection for nested permissions
   * @returns {boolean} True if the user has the permission
   */
  static can(role, section, action, subsection = null) {
    const rolePerms = PERMISSIONS[role]
    if (!rolePerms) return false
    
    // Handle nested permissions
    if (subsection) {
      return rolePerms[section] && 
             rolePerms[section][subsection] && 
             rolePerms[section][subsection].includes(action)
    }
    
    // Handle flat permissions
    if (typeof rolePerms[section] === 'object' && !Array.isArray(rolePerms[section])) {
      // Direct boolean permission (mainly for student fee permissions)
      if (typeof rolePerms[section][action] === 'boolean') {
        return rolePerms[section][action]
      }
      
      // For objects without arrays (complex nested structures)
      return false
    }
    
    // Standard array-based permissions
    return rolePerms[section] && rolePerms[section].includes(action)
  }

  /**
   * Get user's permissions for a specific section
   * @param {string} role - The user's role
   * @param {string} section - The permission section
   * @returns {Array|Object} The permissions for that section
   */
  static getPermissionsForSection(role, section) {
    const rolePerms = PERMISSIONS[role]
    if (!rolePerms) return []
    
    return rolePerms[section] || []
  }
}