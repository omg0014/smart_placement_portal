import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Dashboard.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

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
          {/* Profile Card - Only for Seeker now to avoid redundancy for Recruiters */}
          {user.role === 'seeker' && (
            <div className={styles.profileCard}>
              <div className={styles.profileCover}></div>
              <div className={styles.profileInfo}>
                <div className={styles.avatar}>{getInitials(user.name)}</div>
                <div className={styles.profileName}>{user.name}</div>
                <div className={styles.profileEmail}>{user.email}</div>
                <span className="badge badge-shortlisted">Job Seeker</span>
              </div>
            </div>
          )}

          {/* Quick Stats in sidebar */}
          <div className={styles.sidebarStats}>
            {user.role === 'seeker' && (
              <>
                <div className={styles.sidebarStatItem}>
                  <div className={styles.statIconWrapper} style={{background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.sidebarStatLabel}>Applied</span>
                    <span className={styles.sidebarStatValue}>{applications.length}</span>
                  </div>
                </div>
                <div className={styles.sidebarStatItem}>
                  <div className={styles.statIconWrapper} style={{background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.sidebarStatLabel}>Pending</span>
                    <span className={styles.sidebarStatValue}>{pendingCount}</span>
                  </div>
                </div>
                <div className={styles.sidebarStatItem}>
                  <div className={styles.statIconWrapper} style={{background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div className={styles.statText}>
                    <span className={styles.sidebarStatLabel}>Accepted</span>
                    <span className={styles.sidebarStatValue}>{acceptedCount}</span>
                  </div>
                </div>
                <div className={styles.profileCompleteness}>
                  <div className={styles.completenessHeader}>
                    <span>Profile Completeness</span>
                    <span className={styles.percentage}>{score}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </>
            )}
            {/* Recruiter sidebar is kept empty or minimal for now as we have a rich top row */}
            {user.role === 'recruiter' && (
               <div className={styles.sidebarNote}>
                 <p><strong>Recruitment Command Center</strong></p>
                 <p style={{fontSize: '0.75rem', marginTop: '8px', opacity: 0.8}}>Track applications, manage listings, and discover top talent.</p>
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
                    <div className={styles.sectionIcon}>📄</div>
                    <div className={styles.resumeContent}>
                      <h3 className={styles.premiumTitle}>Professional Resume</h3>
                      <div className={styles.resumeUpload}>
                        <label className={styles.customFileUpload}>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setResumeFile(e.target.files[0])}
                          />
                          <span>{resumeFile ? resumeFile.name : 'Choose new file...'}</span>
                        </label>
                        <button className={styles.uploadResumeBtn} onClick={handleResumeUpload} disabled={!resumeFile}>
                          Upload
                        </button>
                        
                        {resumeName && (
                          <a 
                            href={resumeName.startsWith('http') ? resumeName : `${API_BASE_URL}/uploads/resumes/${resumeName}`}
                            target="_blank" 
                            rel="noreferrer"
                            className={styles.viewResumeActionBtn}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            View Resume
                          </a>
                        )}
                      </div>
                      
                      {uploadMsg && (
                        <p className={styles.uploadStatusMsg}>{uploadMsg}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className={styles.statsRow}>
                    <div 
                      className={`${styles.statCard} ${styles.statApplied} ${styles.clickableStat}`}
                      onClick={() => navigate('/applications')}
                    >
                      <div className={styles.statIcon}>📝</div>
                      <div className={styles.statInfo}>
                        <div className={styles.statNumber}>{applications.length}</div>
                        <div className={styles.statLabel}>Total Applied</div>
                      </div>
                    </div>
                    <div 
                      className={`${styles.statCard} ${styles.statPending} ${styles.clickableStat}`}
                      onClick={() => navigate('/applications')}
                    >
                      <div className={styles.statIcon}>⏳</div>
                      <div className={styles.statInfo}>
                        <div className={styles.statNumber}>{pendingCount}</div>
                        <div className={styles.statLabel}>Pending</div>
                      </div>
                    </div>
                    <div 
                      className={`${styles.statCard} ${styles.statReviewed} ${styles.clickableStat}`}
                      onClick={() => navigate('/applications')}
                    >
                      <div className={styles.statIcon}>👀</div>
                      <div className={styles.statInfo}>
                        <div className={styles.statNumber}>{reviewedCount}</div>
                        <div className={styles.statLabel}>Reviewed</div>
                      </div>
                    </div>
                    <div 
                      className={`${styles.statCard} ${styles.statAccepted} ${styles.clickableStat}`}
                      onClick={() => navigate('/applications')}
                    >
                      <div className={styles.statIcon}>🎉</div>
                      <div className={styles.statInfo}>
                        <div className={styles.statNumber}>{acceptedCount}</div>
                        <div className={styles.statLabel}>Accepted</div>
                      </div>
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
                <div className={styles.profileResumeView}>
                  <div className={styles.profileMainHeader}>
                    <div className={styles.profileHeaderText}>
                      <h3>My Professional Profile</h3>
                      <p>View and manage your career information</p>
                    </div>
                    <button className={styles.editProfileBtn} onClick={() => navigate('/onboarding')}>
                      Edit Profile
                    </button>
                  </div>

                  <div className={styles.profileSectionsGrid}>
                    {/* Section 1: Personal Information */}
                    <div className={`${styles.profileSectionCard} ${styles.shadeLavender} ${styles.hoverableProfileCard}`}>
                      <div className={styles.sectionHeader}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <h4>Personal Information</h4>
                      </div>
                      <div className={styles.profileDataGrid}>
                        <div className={styles.dataItem}>
                          <span className={styles.dataLabel}>Phone</span>
                          <span className={styles.dataValue}>{user.phone || 'Not provided'}</span>
                        </div>
                        <div className={styles.dataItem}>
                          <span className={styles.dataLabel}>Email</span>
                          <span className={styles.dataValue}>{user.email}</span>
                        </div>
                        <div className={styles.dataItemFull}>
                          <span className={styles.dataLabel}>Location</span>
                          <span className={styles.dataValue}>
                            {user.address?.city ? `${user.address.city}, ${user.address.state}, ${user.address.country}` : 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Career Overview */}
                    <div className={`${styles.profileSectionCard} ${styles.shadeMint} ${styles.hoverableProfileCard}`}>
                      <div className={styles.sectionHeader}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                        <h4>Career Overview</h4>
                      </div>
                      <div className={styles.profileDataGrid}>
                        <div className={styles.dataItem}>
                          <span className={styles.dataLabel}>Experience Level</span>
                          <span className={`${styles.dataValue} ${styles.highlightText}`}>{user.experienceLevel || 'Not provided'}</span>
                        </div>
                        <div className={styles.dataItem}>
                          <span className={styles.dataLabel}>Preferred Roles</span>
                          <div className={styles.profileTags}>
                            {user.preferredRoles?.length > 0 ? user.preferredRoles.map((r, i) => <span key={i} className={styles.profileTag}>{r}</span>) : 'Not provided'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Education */}
                    <div className={`${styles.profileSectionCard} ${styles.shadePink} ${styles.hoverableProfileCard}`}>
                      <div className={styles.sectionHeader}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                        <h4>Education</h4>
                      </div>
                      <div className={styles.profileDataGrid}>
                        <div className={styles.dataItemFull}>
                          <span className={styles.dataLabel}>Primary Education</span>
                          <span className={styles.dataValue}>
                            {user.education?.degree ? (
                              <div className={styles.eduBlock}>
                                <strong className={styles.eduDegree}>{user.education.degree}</strong>
                                <span className={styles.eduCollege}>{user.education.college}</span>
                                <span className={styles.eduYear}>Graduation Year: {user.education.year}</span>
                              </div>
                            ) : 'Not provided'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Skills & Bio */}
                    <div className={`${styles.profileSectionCard} ${styles.shadeIndigo} ${styles.hoverableProfileCard}`}>
                      <div className={styles.sectionHeader}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4 4 4-4 4z"/><path d="M3.34 7a10 10 0 1 1 17.32 0"/></svg>
                        <h4>Skills & Expertise</h4>
                      </div>
                      <div className={styles.profileDataGrid}>
                        <div className={styles.dataItemFull}>
                          <div className={styles.profileTags}>
                            {user.skills?.length > 0 ? user.skills.map((s, i) => <span key={i} className={`${styles.profileTag} ${styles.skillTag}`}>{s}</span>) : 'Not provided'}
                          </div>
                        </div>
                        <div className={styles.dataItemFull}>
                          <span className={styles.dataLabel}>Bio / Introduction</span>
                          <p className={styles.bioText}>{user.bio || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 5: Professional Links */}
                    <div className={`${styles.profileSectionCard} ${styles.profileItemFull} ${styles.shadePeach} ${styles.hoverableProfileCard}`}>
                      <div className={styles.sectionHeader}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        <h4>Professional Links</h4>
                      </div>
                      <div className={styles.profileLinksGrid}>
                        {user.linkedin && (
                          <a href={user.linkedin} target="_blank" rel="noreferrer" className={styles.profileLink}>
                            <span>LinkedIn Profile</span>
                          </a>
                        )}
                        {user.portfolio && (
                          <a href={user.portfolio} target="_blank" rel="noreferrer" className={styles.profileLink}>
                            <span>Portfolio / Website</span>
                          </a>
                        )}
                        {!user.linkedin && !user.portfolio && <p className={styles.dataValue}>No links provided</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* === RECRUITER VIEW === */}
          {user.role === 'recruiter' && (
            <div className={styles.recruiterDashboard}>
              {/* Top Row: Profile (2 cols wide) + Stats (1 col each) */}
              <div className={styles.recruiterTopRow}>
                {/* Clean Profile Card */}
                <div className={styles.recruiterProfileCard}>
                  <div className={styles.profileCover}></div>
                  <div className={styles.recruiterProfileInfo}>
                    <div className={styles.largeAvatar}>{getInitials(user.name)}</div>
                    <div className={styles.profileText}>
                      <h2>{user.name}</h2>
                      <p>{user.email}</p>
                      <span className={styles.roleTag}>Recruiter Dashboard</span>
                    </div>
                  </div>
                </div>

                {/* Small Stat Cards */}
                <div className={styles.statCardsGrid}>
                  <div className={styles.miniStatCard}>
                    <div className={`${styles.miniIcon} ${styles.iconGreen}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    </div>
                    <div className={styles.miniContent}>
                      <span className={styles.miniLabel}>Jobs Posted</span>
                      <span className={styles.miniValue}>{myJobs.length}</span>
                    </div>
                  </div>

                  <div className={styles.miniStatCard}>
                    <div className={`${styles.miniIcon} ${styles.iconTeal}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div className={styles.miniContent}>
                      <span className={styles.miniLabel}>Total Applicants</span>
                      <span className={styles.miniValue}>
                        {myJobs.reduce((acc, job) => acc + (job.applicantsCount || 0), 0) || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section: My Job Listings (Full Width) */}
              <div className={styles.recruiterBottomSection}>
                <div className={styles.jobListingsHeader}>
                  <h3 className={styles.sectionTitle}>My Job Listings</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/post-job')}
                    style={{ borderRadius: '100px', padding: '10px 24px', fontSize: '0.9rem' }}
                  >
                    + Post New Job
                  </button>
                </div>

                <div className={styles.recruiterJobsGrid}>
                  {myJobs.length === 0 ? (
                    <div className={styles.emptyState}>
                      <h3>No jobs posted yet</h3>
                      <p>Start by creating your first job listing to find talent.</p>
                    </div>
                  ) : (
                    myJobs.map((job) => (
                      <div key={job._id} className={styles.recruiterJobCard}>
                        <div className={styles.jobCardMain}>
                          <div className={styles.jobCardInfo}>
                            <h4>{job.title}</h4>
                            <p>{job.company} • {job.location}</p>
                            <div className={styles.jobCardBadges}>
                              <span className={styles.pillBadge}>{job.jobType}</span>
                              <span className={styles.pillBadge}>{job.location === 'Remote' ? 'Remote' : 'On-site'}</span>
                              <span className={`${styles.pillBadge} ${styles.applicantBadge}`}>
                                {job.applicantsCount || 0} Applicants
                              </span>
                            </div>
                          </div>
                          <div className={styles.jobCardActions}>
                            <button
                              className={styles.pillActionBtn}
                              onClick={() => navigate(`/applicants/${job._id}`)}
                            >
                              Applicants
                            </button>
                            <button
                              className={styles.pillActionBtn}
                              onClick={() => navigate(`/edit-job/${job._id}`)}
                            >
                              Edit
                            </button>
                            <button
                              className={`${styles.pillActionBtn} ${styles.deleteBtn}`}
                              onClick={() => handleDeleteJob(job._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
