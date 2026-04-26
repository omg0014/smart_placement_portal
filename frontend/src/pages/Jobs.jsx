import { useState, useEffect } from 'react';
import api from '../api/axios';
import JobCard from '../components/JobCard';
import styles from './Jobs.module.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  // fetch jobs whenever filters change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (location) params.location = location;
        if (jobType) params.jobType = jobType;

        const res = await api.get('/jobs', { params });
        setJobs(res.data.jobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    // debounce the search a little
    const timer = setTimeout(fetchJobs, 300);
    return () => clearTimeout(timer);
  }, [search, location, jobType]);

  return (
    <div className={styles.jobsPage}>
      <div className="page-header">
        <h1>Browse Jobs</h1>
        <p>Find your next opportunity</p>
      </div>

      {/* Search & Filter Bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="🔍 Search by title or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="📍 Location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="internship">Internship</option>
          <option value="contract">Contract</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <h3>No jobs found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p className={styles.resultCount}>{jobs.length} jobs found</p>
          <div className={styles.jobsGrid}>
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Jobs;
