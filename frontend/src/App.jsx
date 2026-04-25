import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

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
import Onboarding from './pages/Onboarding';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Routes>
      {/* ===== Public Auth Routes ===== */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />

      {/* ===== Protected Dashboard Routes ===== */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                {/* Available for all logged-in users */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                
                {/* Seeker only routes */}
                {user?.role === 'seeker' && (
                  <>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="/saved-jobs" element={<SavedJobs />} />
                  </>
                )}

                {/* Recruiter only routes */}
                {user?.role === 'recruiter' && (
                  <>
                    <Route path="/post-job" element={<PostJob />} />
                    <Route path="/edit-job/:id" element={<PostJob />} />
                    <Route path="/applications" element={<Applications />} />
                    <Route path="/applicants/:jobId" element={<Applicants />} />
                  </>
                )}

                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
