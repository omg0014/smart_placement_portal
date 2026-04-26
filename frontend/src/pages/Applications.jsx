import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Applications.module.css';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/applications');
        setApplications(res.data.applications);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitial = (name) => name ? name[0].toUpperCase() : 'J';

  const shades = [
    styles.shadeLavender,
    styles.shadeMint,
    styles.shadePink,
    styles.shadeIndigo,
    styles.shadePeach,
    styles.shadeGray
  ];

  if (loading) return <div className="loading">Loading applications...</div>;

  return (
    <div className={styles.applicationsPage}>
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track your recruitment journey and application status</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p>Start applying to jobs to see them here</p>
        </div>
      ) : (
        <div className={styles.seekerAppGrid}>
          {applications.map((app, index) => {
            const shadeClass = shades[index % shades.length];
            return (
              <div key={app._id} className={`${styles.seekerAppCard} ${shadeClass}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.companyAvatar}>{getInitial(app.job?.company)}</div>
                  <div className={styles.jobTitleArea}>
                    <h3>{app.job?.title || 'Job removed'}</h3>
                    <p className={styles.companyName}>{app.job?.company}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[app.status]}`}>
                    {app.status}
                  </span>
                </div>

              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Location</span>
                    <span className={styles.infoValue}>📍 {app.job?.location || 'Remote'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Applied On</span>
                    <span className={styles.infoValue}>🗓️ {formatDate(app.createdAt)}</span>
                  </div>
                </div>
              </div>

               <div className={styles.cardFooter}>
                  <button 
                    className={styles.viewDetailsBtn} 
                    onClick={() => window.location.href = `/jobs/${app.job?._id}`}
                  >
                    View Job Details
                  </button>
               </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
