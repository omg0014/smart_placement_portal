import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [myJobs, setMyJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState(user?.resume || '');
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'recruiter') {
          const res = await api.get('/jobs/my/posted');
          setMyJobs(res.data.jobs);
        } else {
          const res = await api.get('/applications');
          setApplications(res.data.applications);

          const meRes = await api.get('/auth/me');
          setResumeName(meRes.data.user.resume || '');
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const res = await api.post('/applications/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeName(res.data.resume);
      setUploadMsg('Resume uploaded successfully!');
      setResumeFile(null);
    } catch (error) {
      setUploadMsg('Failed to upload resume');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setMyJobs(myJobs.filter((j) => j._id !== jobId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  // count helpers for seeker
  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const acceptedCount = applications.filter(
    (a) => a.status === 'shortlisted' || a.status === 'accepted'
  ).length;
  const reviewedCount = applications.filter((a) => a.status === 'reviewed').length;

  // Calculate completeness
  let score = 0;
  if (user.phone) score += 10;
  if (user.address?.city) score += 10;
  if (user.education?.college) score += 10;
  if (user.experienceLevel) score += 10;
  if (user.preferredRoles?.length > 0) score += 15;
  if (user.skills?.length > 0) score += 15;
  if (user.linkedin) score += 10;
  if (user.bio) score += 10;
  if (user.resume) score += 10;


  return (
    <div className={styles.dashboardPage}>
      <div className="page-header">
        <h1>
          {user.role === 'recruiter' ? 'Recruiter Dashboard' : 'My Dashboard'}
        </h1>
        <p>Welcome back, {user.name}!</p>
      </div>

      <div className={styles.dashboardLayout}>
        {/* ========== SIDEBAR ========== */}
        <aside className={styles.sidebar}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.avatar}>{getInitials(user.name)}</div>
            <div className={styles.profileName}>{user.name}</div>
            <div className={styles.profileEmail}>{user.email}</div>
            <span className={`badge badge-${user.role === 'recruiter' ? 'reviewed' : 'shortlisted'}`}>
              {user.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
            </span>
          </div>

          {/* Quick Stats in sidebar */}
          <div className={styles.sidebarStats}>
            {user.role === 'seeker' && (
              <>
                <div className={styles.sidebarStatItem}>
                  <span className={styles.sidebarStatLabel}>Applied</span>
                  <span className={styles.sidebarStatValue}>{applications.length}</span>
                </div>
                <div className={styles.sidebarStatItem}>
                  <span className={styles.sidebarStatLabel}>Pending</span>
                  <span className={styles.sidebarStatValue}>{pendingCount}</span>
                </div>
                <div className={styles.sidebarStatItem}>
                  <span className={styles.sidebarStatLabel}>Accepted</span>
                  <span className={styles.sidebarStatValue}>{acceptedCount}</span>
                </div>
                <div className={styles.profileCompleteness}>
                  <div className={styles.completenessHeader}>
                    <span>Profile Completeness</span>
                    <span>{score}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </>
            )}
            {user.role === 'recruiter' && (
              <div className={styles.sidebarStatItem}>
                <span className={styles.sidebarStatLabel}>Jobs Posted</span>
                <span className={styles.sidebarStatValue}>{myJobs.length}</span>
              </div>
            )}
          </div>
        </aside>

        {/* ========== MAIN CONTENT ========== */}
        <main className={styles.mainContent}>
          {/* === SEEKER VIEW === */}
          {user.role === 'seeker' && (
            <>
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  My Profile
                </button>
              </div>

              {activeTab === 'overview' && (
                <>
                  {/* Resume Upload */}
                  <div className={styles.resumeSection}>
                    <h3>📄 My Resume</h3>
                    <div className={styles.resumeUpload}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                      />
                      <button className="btn btn-primary btn-small" onClick={handleResumeUpload}>
                        Upload
                      </button>
                    </div>
                    {resumeName && (
                      <p className={styles.currentResume}>✓ Current: {resumeName}</p>
                    )}
                    {uploadMsg && (
                      <p className={styles.currentResume}>{uploadMsg}</p>
                    )}
                  </div>

                  {/* Stats Row */}
                  <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                      <div className={styles.statNumber}>{applications.length}</div>
                      <div className={styles.statLabel}>Total Applied</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statNumber}>{pendingCount}</div>
                      <div className={styles.statLabel}>Pending</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statNumber}>{reviewedCount}</div>
                      <div className={styles.statLabel}>Reviewed</div>
                    </div>
                    <div className={styles.statCard}>
                      <div className={styles.statNumber}>{acceptedCount}</div>
                      <div className={styles.statLabel}>Accepted</div>
                    </div>
                  </div>

                  {/* Recent Applications List */}
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Recent Applications</h3>
                  </div>

                  {applications.length === 0 ? (
                    <div className="empty-state">
                      <p>You haven't applied to any jobs yet.</p>
                    </div>
                  ) : (
                    applications.slice(0, 6).map((app) => (
                      <div key={app._id} className={styles.jobRow}>
                        <div className={styles.jobRowInfo}>
                          <h4>{app.job?.title || 'Job removed'}</h4>
                          <p>{app.job?.company} • {app.job?.location}</p>
                        </div>
                        <span className={`badge badge-${app.status}`}>{app.status}</span>
                      </div>
                    ))
                  )}
                </>
              )}

              {activeTab === 'profile' && (
                <div className={styles.profileDetailsCard}>
                  <div className={styles.profileHeader}>
                    <h3>Professional Profile</h3>
                    <button className="btn btn-secondary btn-small" onClick={() => navigate('/onboarding')}>Edit Profile</button>
                  </div>
                  <div className={styles.profileGrid}>
                    <div className={styles.profileItem}>
                      <span className={styles.label}>Phone</span>
                      <span className={styles.value}>{user.phone || 'Not provided'}</span>
                    </div>
                    <div className={styles.profileItem}>
                      <span className={styles.label}>Location</span>
                      <span className={styles.value}>
                        {user.address?.city ? `${user.address.city}, ${user.address.state}, ${user.address.country}` : 'Not provided'}
                      </span>
                    </div>
                    <div className={styles.profileItem}>
                      <span className={styles.label}>Experience</span>
                      <span className={styles.value}>{user.experienceLevel || 'Not provided'}</span>
                    </div>
                    <div className={styles.profileItem}>
                      <span className={styles.label}>Education</span>
                      <span className={styles.value}>
                        {user.education?.degree ? `${user.education.degree} from ${user.education.college} (${user.education.year})` : 'Not provided'}
                      </span>
                    </div>
                    <div className={styles.profileItemFull}>
                      <span className={styles.label}>Preferred Roles</span>
                      <div className={styles.tags}>
                        {user.preferredRoles?.length > 0 ? user.preferredRoles.map((r, i) => <span key={i} className={styles.tag}>{r}</span>) : 'Not provided'}
                      </div>
                    </div>
                    <div className={styles.profileItemFull}>
                      <span className={styles.label}>Skills</span>
                      <div className={styles.tags}>
                        {user.skills?.length > 0 ? user.skills.map((s, i) => <span key={i} className={styles.tag}>{s}</span>) : 'Not provided'}
                      </div>
                    </div>
                    <div className={styles.profileItemFull}>
                      <span className={styles.label}>Bio</span>
                      <span className={styles.value}>{user.bio || 'Not provided'}</span>
                    </div>
                    <div className={styles.profileItem}>
                      <span className={styles.label}>LinkedIn</span>
                      <span className={styles.value}>
                        {user.linkedin ? <a href={user.linkedin} target="_blank" rel="noreferrer">View Profile</a> : 'Not provided'}
                      </span>
                    </div>
                    <div className={styles.profileItem}>
                      <span className={styles.label}>Portfolio/GitHub</span>
                      <span className={styles.value}>
                        {user.portfolio ? <a href={user.portfolio} target="_blank" rel="noreferrer">View Portfolio</a> : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* === RECRUITER VIEW === */}
          {user.role === 'recruiter' && (
            <>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>My Job Listings</h3>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => navigate('/post-job')}
                >
                  + Post New Job
                </button>
              </div>

              {myJobs.length === 0 ? (
                <div className="empty-state">
                  <h3>No jobs posted yet</h3>
                  <p>Click "Post New Job" to create your first listing</p>
                </div>
              ) : (
                myJobs.map((job) => (
                  <div key={job._id} className={styles.jobRow}>
                    <div className={styles.jobRowInfo}>
                      <h4>{job.title}</h4>
                      <p>{job.company} • {job.location}</p>
                    </div>
                    <div className={styles.jobRowActions}>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => navigate(`/applicants/${job._id}`)}
                      >
                        Applicants
                      </button>
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => navigate(`/edit-job/${job._id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
