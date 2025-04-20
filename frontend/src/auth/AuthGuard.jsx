import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import { RoleManager } from '../utils/roles'

export const AuthGuard = ({ children, requiredPermission, section, action, subsection }) => {
  const { user, isAuthenticated } = useStore(state => state.auth)
  const location = useLocation()
  
  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  // Check for required permission if specified
  if (requiredPermission || (section && action)) {
    const hasPermission = requiredPermission 
      ? RoleManager.hasPermission(user.role, requiredPermission)
      : RoleManager.can(user.role, section, action, subsection)
      
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />
    }
  }
  
  return children
}