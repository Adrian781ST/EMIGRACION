import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, userProfile } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles.length > 0 && !roles.includes(userProfile?.tipo)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
