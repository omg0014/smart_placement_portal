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

  if (loading) return <div className="loading">Loading applications...</div>;

  return (
    <div className={styles.applicationsPage}>
      <div className="page-header">
        <h1>My Applications</h1>
        <p>Track the status of your job applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p>Start applying to jobs to see them here</p>
        </div>
      ) : (
        <div className={styles.appList}>
          {applications.map((app) => (
            <div key={app._id} className={styles.appCard}>
              <div className={styles.appInfo}>
                <h3>{app.job?.title || 'Job removed'}</h3>
                <p>
                  {app.job?.company} • {app.job?.location}
                </p>
              </div>
              <div className={styles.appMeta}>
                <span className={styles.dateText}>
                  Applied {formatDate(app.createdAt)}
                </span>
                <span className={`badge badge-${app.status}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
