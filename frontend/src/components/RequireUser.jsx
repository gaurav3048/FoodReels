import { Navigate, useLocation } from 'react-router-dom'
import { getUserId } from '../utils/userSession'

const RequireUser = ({ children }) => {
  const location = useLocation()

  if (!getUserId()) {
    return <Navigate to="/user/login" replace state={{ from: location.pathname + location.search }} />
  }

  return children
}

export default RequireUser
