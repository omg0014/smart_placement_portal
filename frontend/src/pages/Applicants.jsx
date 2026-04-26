import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './Applications.module.css';

// recruiter page: view all applicants for a specific job
const Applicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // dynamically determine the base URL for the backend
  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002';

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        // get job info
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJobTitle(jobRes.data.job.title);

        // get applicants
        const res = await api.get(`/applications/job/${jobId}`);
        setApplicants(res.data.applications);
      } catch (error) {
        console.error('Failed to fetch applicants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      // update locally
      setApplicants(
        applicants.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) return <div className="loading">Loading applicants...</div>;

  return (
    <div className={styles.applicationsPage}>
      <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Dashboard
      </button>

      <div className="page-header">
        <h1>Applicants for "{jobTitle}"</h1>
        <p>{applicants.length} applicant(s)</p>
      </div>

      {applicants.length === 0 ? (
        <div className="empty-state">
          <h3>No applicants yet</h3>
          <p>Check back later for new applications</p>
        </div>
      ) : (
        <div className={styles.applicantList}>
          {applicants.map((app) => (
            <div key={app._id} className={styles.premiumApplicantCard}>
              {/* Card Top Section: Avatar + Name + Basic Info */}
              <div className={styles.cardTop}>
                <div className={styles.applicantMain}>
                  <div className={styles.applicantAvatar}>
                    {app.applicant?.name?.split(' ').map(n => n[0]).join('') || '?'}
                  </div>
                  <div className={styles.applicantTitle}>
                    <h4>{app.applicant?.name || 'Unknown'}</h4>
                    <p>{app.applicant?.email}</p>
                  </div>
                </div>
                <div className={styles.statusSection}>
                  <span className={`badge badge-${app.status}`}>{app.status}</span>
                </div>
              </div>

              {/* Card Content: Grid of info */}
              <div className={styles.cardContent}>
                <div className={styles.applicantDetailsGrid}>
                  {app.applicant?.phone && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Phone</span>
                      <span className={styles.detailValue}>📞 {app.applicant.phone}</span>
                    </div>
                  )}
                  {app.applicant?.address?.city && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Location</span>
                      <span className={styles.detailValue}>📍 {app.applicant.address.city}, {app.applicant.address.state}</span>
                    </div>
                  )}
                  {app.applicant?.experienceLevel && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Experience</span>
                      <span className={styles.detailValue} style={{color: 'var(--primary)', fontWeight: '700'}}>
                        {app.applicant.experienceLevel}
                      </span>
                    </div>
                  )}
                  {app.applicant?.education?.degree && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Education</span>
                      <span className={styles.detailValue}>{app.applicant.education.degree}</span>
                    </div>
                  )}
                </div>

                {/* Skills Section */}
                {app.applicant?.skills?.length > 0 && (
                  <div className={styles.skillsSection}>
                    <span className={styles.detailLabel}>Technical Skills</span>
                    <div className={styles.applicantSkills}>
                      {app.applicant.skills.map((skill, i) => (
                        <span key={i} className={styles.skillChip}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio Section */}
                {app.applicant?.bio && (
                  <div className={styles.bioSection}>
                    <span className={styles.detailLabel}>About the Candidate</span>
                    <p>"{app.applicant.bio}"</p>
                  </div>
                )}
              </div>

              {/* Card Footer: Links + Status Update */}
              <div className={styles.cardFooter}>
                <div className={styles.footerLinks}>
                  {app.applicant?.resume && (
                    <a
                      href={app.applicant.resume.startsWith('http') ? app.applicant.resume : `${API_BASE_URL}/uploads/resumes/${app.applicant.resume}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.actionLink}
                    >
                      📄 Resume
                    </a>
                  )}
                  {app.applicant?.linkedin && (
                    <a href={app.applicant.linkedin} target="_blank" rel="noreferrer" className={styles.actionLink}>
                      🔗 LinkedIn
                    </a>
                  )}
                  {app.applicant?.portfolio && (
                    <a href={app.applicant.portfolio} target="_blank" rel="noreferrer" className={styles.actionLink}>
                      🌐 Portfolio
                    </a>
                  )}
                </div>

                <div className={styles.statusUpdate}>
                  <select
                    className={styles.modernSelect}
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applicants;
