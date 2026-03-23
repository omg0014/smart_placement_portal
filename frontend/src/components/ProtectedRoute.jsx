import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// wraps routes that require authentication
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // not logged in — redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // check role if specified
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/jobs" />;
  }

  return children;
};

export default ProtectedRoute;
