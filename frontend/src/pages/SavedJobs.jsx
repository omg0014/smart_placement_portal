import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import JobCard from '../components/JobCard';
import styles from './Jobs.module.css';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get('/applications/saved-jobs');
        setSavedJobs(res.data.savedJobs);
      } catch (error) {
        console.error('Failed to fetch saved jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  if (loading) return <div className="loading">Loading saved jobs...</div>;

  return (
    <div className={styles.jobsPage}>
      <div className="page-header">
        <h1>Saved Jobs</h1>
        <p>Jobs you've bookmarked for later</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="empty-state">
          <h3>No saved jobs</h3>
          <p>Browse jobs and click the save button to bookmark them</p>
        </div>
      ) : (
        <div className={styles.jobsGrid}>
          {savedJobs.map((job) => (
            <JobCard key={job._id} job={job} isSaved={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
