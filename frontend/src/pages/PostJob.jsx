import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import styles from './PostJob.module.css';

const PostJob = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // if editing an existing job
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'full-time',
    requirements: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // if editing, load the existing job data
  useEffect(() => {
    if (isEditing) {
      const fetchJob = async () => {
        try {
          const res = await api.get(`/jobs/${id}`);
          const job = res.data.job;
          setForm({
            title: job.title,
            description: job.description,
            company: job.company,
            location: job.location,
            salary: job.salary,
            jobType: job.jobType,
            requirements: job.requirements || '',
          });
        } catch (err) {
          setError('Could not load job details');
        }
      };
      fetchJob();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await api.put(`/jobs/${id}`, form);
      } else {
        await api.post('/jobs', form);
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save job';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.postJobPage}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2>{isEditing ? 'Edit Job Listing' : 'Create New Job Listing'}</h2>
          <p>Fill in the details below to reach the best candidates</p>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.jobForm}>
          {/* Section 1: Basic Info */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Job Title</label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="company">Company Name</label>
                <input
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. Acme Innovations"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Job Details */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Job Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, Remote"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="jobType">Employment Type</label>
                <select
                  id="jobType"
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="internship">Internship</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="salary">Salary Range</label>
                <input
                  id="salary"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="e.g. ₹8L - ₹12L PA"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Description & Requirements */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Job Description</h3>
            <div className={styles.formGroup}>
              <label htmlFor="description">About the Role</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Detailed description of the role..."
                required
                rows={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="requirements">Key Requirements</label>
              <textarea
                id="requirements"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                placeholder="Skills, experience, etc..."
                rows={4}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Processing...' : isEditing ? 'Update Listing' : 'Post Job Listing'}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate('/dashboard')}
            >
              Discard Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
