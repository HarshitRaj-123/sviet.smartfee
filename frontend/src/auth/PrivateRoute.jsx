import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import { RoleManager } from '../utils/roles'

export const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useStore((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && !RoleManager.hasPermission(user.role, requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}