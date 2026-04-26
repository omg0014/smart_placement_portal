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

        if (user && user.role === 'seeker') {
          const meRes = await api.get('/auth/me');
          const savedIds = meRes.data.user.savedJobs || [];
          setSaved(savedIds.includes(id));

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
      <button className={styles.backButton} onClick={() => navigate('/jobs')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Jobs
      </button>

      <div className={styles.premiumDetailCard}>
        {/* Banner Section */}
        <div className={styles.detailBanner}>
          <div className={styles.bannerContent}>
            <div className={styles.companyInitial}>{job.company[0]}</div>
            <div className={styles.headerInfo}>
              <h1>{job.title}</h1>
              <div className={styles.companyPill}>{job.company}</div>
            </div>
          </div>
          {user && user.role === 'seeker' && (
             <button className={`${styles.saveIconBtn} ${saved ? styles.saved : ''}`} onClick={handleSave}>
               {saved ? '❤️' : '🤍'}
             </button>
          )}
        </div>

        {/* Feature Grid */}
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.fIcon}>📍</div>
            <div className={styles.fText}>
               <span className={styles.fLabel}>Location</span>
               <span className={styles.fValue}>{job.location}</span>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.fIcon}>💰</div>
            <div className={styles.fText}>
               <span className={styles.fLabel}>Annual Package</span>
               <span className={styles.fValue}>₹ {job.salary}</span>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.fIcon}>💼</div>
            <div className={styles.fText}>
               <span className={styles.fLabel}>Job Type</span>
               <span className={styles.fValue}>{job.jobType}</span>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.fIcon}>🗓️</div>
            <div className={styles.fText}>
               <span className={styles.fLabel}>Posted On</span>
               <span className={styles.fValue}>{formatDate(job.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className={styles.mainDescriptionSection}>
          <div className={styles.descriptionBlock}>
            <h3 className={styles.premiumHeading}>Description</h3>
            <p className={styles.premiumText}>{job.description}</p>
          </div>

          {job.requirements && (
            <div className={styles.descriptionBlock}>
              <h3 className={styles.premiumHeading}>Requirements</h3>
              <div className={styles.requirementsList}>
                {job.requirements.split('\n').map((line, idx) => (
                  <div key={idx} className={styles.reqLine}>
                    <span className={styles.bullet}>✦</span>
                    <p>{line}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footerInfo}>
           <div className={styles.postedByCard}>
              <div className={styles.pIcon}>👤</div>
              <div className={styles.pContent}>
                 <span>Posted by hiring manager</span>
                 <strong>{job.postedBy?.name}</strong>
              </div>
           </div>

           {message && (
             <div className={styles.inlineMessage}>
                {message}
             </div>
           )}

           <div className={styles.actionBlock}>
              {user && user.role === 'seeker' && (
                <button
                  className={`${styles.mainApplyBtn} ${applied ? styles.appliedBtn : ''}`}
                  onClick={handleApply}
                  disabled={applied}
                >
                  {applied ? '✓ Already Applied' : 'Submit Application'}
                </button>
              )}

              {user && user.role === 'recruiter' && job.postedBy?._id === user.id && (
                <button
                  className={styles.mainApplyBtn}
                  onClick={() => navigate(`/edit-job/${job._id}`)}
                >
                  Edit Job Listing
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
