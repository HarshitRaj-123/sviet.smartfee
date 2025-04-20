import { ROLES, ROLE_HIERARCHY } from '../config/constants'

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
}