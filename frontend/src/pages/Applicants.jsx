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
      <span
        style={{ cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}
        onClick={() => navigate('/dashboard')}
      >
        ← Back to Dashboard
      </span>

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
        <div className={styles.appList}>
          {applicants.map((app) => (
            <div key={app._id} className={styles.applicantCard}>
              <div className={styles.applicantInfo}>
                <h4>{app.applicant?.name || 'Unknown'}</h4>
                <p>{app.applicant?.email}</p>
                {app.applicant?.resume && (
                  <a
                    href={`http://localhost:5001/uploads/resumes/${app.applicant.resume}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.resumeLink}
                  >
                    📄 View Resume
                  </a>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge badge-${app.status}`}>{app.status}</span>
                <select
                  className={styles.statusSelect}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Applicants;
