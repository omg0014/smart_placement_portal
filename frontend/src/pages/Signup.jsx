import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Auth.module.css';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seeker',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/signup', form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      {/* Left: Branding Panel */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <span className={styles.brandIcon}>🚀</span>
          <h1>Join Smart Job Portal</h1>
          <p>Create your free account and start your journey toward your dream career — or find the perfect candidate.</p>

          <div className={styles.brandFeatures}>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>✅</span>
              <span>Free account for seekers & recruiters</span>
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>⚡</span>
              <span>Post jobs or apply in seconds</span>
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>🔐</span>
              <span>Secure & private by default</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Signup Form */}
      <div className={styles.formPanel}>
        <div className={styles.authCard}>
          <h2>Create your account</h2>
          <p className={styles.subtitle}>Fill in your details to get started</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>👤</span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Om Gupta"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="om@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">I am a...</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="seeker">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className={styles.authFooter}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
