import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guards a page: only a signed-in user with an allowed role gets through.
 *
 * Not signed in          -> /login  (remembering where they were going)
 * Signed in, wrong role  -> /dashboard
 *
 * The client-side counterpart of the API's 403.
 */
const ProtectedRoute = ({ children, allow }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow && allow.length > 0 && !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
