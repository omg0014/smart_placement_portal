import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Auth.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
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
          <span className={styles.brandIcon}>💼</span>
          <h1>Smart Job Portal</h1>
          <p>Your gateway to finding the perfect career opportunity or hiring top talent.</p>

          <div className={styles.brandFeatures}>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>🔍</span>
              <span>Search thousands of job listings</span>
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>📄</span>
              <span>Upload resume & apply instantly</span>
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>📊</span>
              <span>Track your application status</span>
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>👥</span>
              <span>Connect with top recruiters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className={styles.formPanel}>
        <div className={styles.authCard}>
          <h2>Welcome back</h2>
          <p className={styles.subtitle}>Enter your credentials to access your account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="om@gmail.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputIcon}>🔒</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className={styles.authFooter}>
            Don't have an account? <Link to="/signup">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
