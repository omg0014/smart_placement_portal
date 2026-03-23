import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './JobDetails.module.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.job);

        // check if user has already saved this job
        if (user && user.role === 'seeker') {
          const meRes = await api.get('/auth/me');
          const savedIds = meRes.data.user.savedJobs || [];
          setSaved(savedIds.includes(id));

          // check if already applied
          const appRes = await api.get('/applications');
          const hasApplied = appRes.data.applications.some(
            (app) => app.job?._id === id
          );
          setApplied(hasApplied);
        }
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user]);

  const handleApply = async () => {
    try {
      await api.post('/applications', { jobId: id });
      setApplied(true);
      setMessage('Application submitted successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not apply';
      setMessage(msg);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.post('/applications/save-job', { jobId: id });
      setSaved(res.data.saved);
      setMessage(res.data.message);
    } catch (error) {
      setMessage('Could not save job');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) return <div className="loading">Loading job details...</div>;
  if (!job) return <div className="empty-state"><h3>Job not found</h3></div>;

  return (
    <div className={styles.detailsPage}>
      <span className={styles.backLink} onClick={() => navigate('/jobs')}>
        ← Back to Jobs
      </span>

      <div className={styles.detailCard}>
        <div className={styles.detailHeader}>
          <h1>{job.title}</h1>
          <p className={styles.company}>{job.company}</p>

          <div className={styles.metaRow}>
            <span className={styles.metaItem}>📍 {job.location}</span>
            <span className={styles.metaItem}>💰 {job.salary}</span>
            <span className={styles.metaItem}>📋 {job.jobType}</span>
            <span className={styles.metaItem}>📅 {formatDate(job.createdAt)}</span>
          </div>
        </div>

        <h3 className={styles.sectionTitle}>Description</h3>
        <p className={styles.description}>{job.description}</p>

        {job.requirements && (
          <>
            <h3 className={styles.sectionTitle}>Requirements</h3>
            <p className={styles.description}>{job.requirements}</p>
          </>
        )}

        {job.postedBy && (
          <p className={styles.postedBy}>
            Posted by: {job.postedBy.name} ({job.postedBy.email})
          </p>
        )}

        {message && (
          <div className="success-message" style={{ marginTop: '16px' }}>
            {message}
          </div>
        )}

        {/* action buttons for seekers */}
        {user && user.role === 'seeker' && (
          <div className={styles.actions}>
            <button
              className="btn btn-primary"
              onClick={handleApply}
              disabled={applied}
            >
              {applied ? '✓ Applied' : 'Apply Now'}
            </button>
            <button className="btn btn-secondary" onClick={handleSave}>
              {saved ? '♥ Saved' : '♡ Save Job'}
            </button>
          </div>
        )}

        {/* recruiter can edit if they own this job */}
        {user && user.role === 'recruiter' && job.postedBy?._id === user.id && (
          <div className={styles.actions}>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/edit-job/${job._id}`)}
            >
              Edit Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
