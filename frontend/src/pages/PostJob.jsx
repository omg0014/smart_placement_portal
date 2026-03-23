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
        <h2>{isEditing ? 'Edit Job' : 'Post a New Job'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Job Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company Name</label>
            <input
              id="company"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              required
            />
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="salary">Salary</label>
            <input
              id="salary"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="e.g. ₹5,00,000 - ₹8,00,000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="jobType">Job Type</label>
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

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements (optional)</label>
            <textarea
              id="requirements"
              name="requirements"
              value={form.requirements}
              onChange={handleChange}
              placeholder="List any specific skills, qualifications, or experience needed..."
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? 'Saving...'
                : isEditing
                ? 'Update Job'
                : 'Post Job'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
