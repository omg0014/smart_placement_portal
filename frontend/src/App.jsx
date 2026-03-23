import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import PostJob from './pages/PostJob';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Applicants from './pages/Applicants';
import SavedJobs from './pages/SavedJobs';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* public routes */}
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />

        {/* protected routes — any logged-in user */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* seeker-only routes */}
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <Applications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute allowedRoles={['seeker']}>
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        {/* recruiter-only routes */}
        <Route
          path="/post-job"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-job/:id"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicants/:jobId"
          element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <Applicants />
            </ProtectedRoute>
          }
        />

        {/* default redirect */}
        <Route path="*" element={<Navigate to="/jobs" />} />
      </Routes>
    </>
  );
}

export default App;
