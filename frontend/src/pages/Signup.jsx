import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import styles from './Auth.module.css';

const OTP_LENGTH = 6;

const Signup = () => {
  // ── Step 1: registration form ─────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seeker',
  });

  // ── Step 2: OTP verification ──────────────────────────────────────────
  const [step, setStep] = useState(1); // 1 = form, 2 = otp
  const [stateId, setStateId] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  // ── Shared ────────────────────────────────────────────────────────────
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Step 1: send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/send-otp', form);
      setStateId(res.data.state_id);
      setStep(2);
      setCountdown(60);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      toast.success('OTP sent to your email!');
      // Focus first OTP box after render
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: resend OTP
  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/send-otp', form);
      setStateId(res.data.state_id);
      setCountdown(60);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      const msg = 'A new OTP has been sent to your email.';
      setSuccess(msg);
      toast.success(msg);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: handle OTP digit input
  const handleOtpChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newDigits = [...otpDigits];
    newDigits[idx] = value.slice(-1); // take last char
    setOtpDigits(newDigits);

    // Auto-advance
    if (value && idx < OTP_LENGTH - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const newDigits = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    setOtpDigits(newDigits);
    // Focus last filled box
    const lastIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[lastIdx]?.focus();
  };

  // Step 2: verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits.`);
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', { state_id: stateId, otp });
      toast.success('Account created successfully!');
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={styles.authPage}>
      {/* Left: Branding Panel */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <span className={styles.brandIcon}>🚀</span>
          <h1>Join Smart Job Portal</h1>
          <p>
            Create your free account and start your journey toward your dream career — or find
            the perfect candidate.
          </p>

          <div className={styles.brandFeatures}>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>✅</span>
              <span>Free account for seekers &amp; recruiters</span>
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>⚡</span>
              <span>Post jobs or apply in seconds</span>
            </div>
            <div className={styles.brandFeature}>
              <span className={styles.featureIcon}>🔐</span>
              <span>Email OTP verification via MojoAuth</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className={styles.formPanel}>
        <div className={styles.authCard}>
          {/* ── Step 1: Registration Form ── */}
          {step === 1 && (
            <>
              <h2>Create your account</h2>
              <p className={styles.subtitle}>Fill in your details — we'll verify your email via OTP</p>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSendOtp}>
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
                  <select id="role" name="role" value={form.role} onChange={handleChange}>
                    <option value="seeker">Job Seeker</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send Verification OTP →'}
                </button>
              </form>

              <div className={styles.authFooter}>
                Already have an account? <Link to="/login">Sign in</Link>
              </div>
            </>
          )}

          {/* ── Step 2: OTP Verification ── */}
          {step === 2 && (
            <>
              <div className={styles.otpHeader}>
                <span className={styles.otpIcon}>📧</span>
                <h2>Verify your email</h2>
                <p className={styles.subtitle}>
                  We sent a {OTP_LENGTH}-digit code to <strong>{form.email}</strong>.
                  <br />Enter it below to complete signup.
                </p>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className={styles.successMessage}>{success}</div>}

              <form onSubmit={handleVerify}>
                <div className={styles.otpGroup}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      id={`otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      className={styles.otpBox}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || otpDigits.join('').length < OTP_LENGTH}
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
              </form>

              <div className={styles.otpFooter}>
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>

                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setSuccess('');
                  }}
                >
                  ← Change email / details
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
