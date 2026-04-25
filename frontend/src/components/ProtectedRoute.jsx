import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// wraps routes that require authentication
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  // enforce onboarding for seekers
  if (user.role === 'seeker' && !user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }



  return children;
};

export default ProtectedRoute;
