import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import styles from './Auth.module.css';
import authIllustration from '../assets/auth_illustration.png';

const OTP_LENGTH = 6;

const Auth = ({ mode: initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [step, setStep] = useState(1); // 1-4 for signup
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [stateId, setStateId] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const otpRefs = useRef([]);

  const { login, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seeker',
    skills: '',
    preferredRoles: '',
  });
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'signup' || m === 'login') setMode(m);
  }, [searchParams]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleMode = (newMode) => {
    setMode(newMode);
    setStep(1);
    setOtpDigits(Array(OTP_LENGTH).fill(''));
  };

  // ── Authentication Handlers ──────────────────────────────────────────

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      toast.success('Welcome back!');
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // We only send the basic info for now as per backend expectations
      const res = await api.post('/auth/send-otp', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setStateId(res.data.state_id);
      setStep(4);
      setCountdown(60);
      toast.success('Verification code sent to your email!');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate signup.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length < OTP_LENGTH) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { state_id: stateId, otp });
      const { user, token } = res.data;
      
      // Store auth state immediately
      login(user, token);

      // Now, if they are a seeker and provided skills/resume, update profile
      if (user.role === 'seeker') {
        try {
          // 1. Upload Resume if exists
          if (resumeFile) {
            const resumeData = new FormData();
            resumeData.append('resume', resumeFile);
            await api.post('/applications/upload-resume', resumeData, {
              headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
            });
          }

          // 2. Update Profile with Skills and Roles
          const profileData = {
            skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
            preferredRoles: formData.preferredRoles.split(',').map(r => r.trim()).filter(Boolean),
          };
          const profileRes = await api.put('/api/profile', profileData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          updateUser(profileRes.data.user);
        } catch (profileErr) {
          console.error('Failed to update extra profile info:', profileErr);
          toast.error('Account created, but profile details failed to save. You can update them in settings.');
        }
      }

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', formData);
      setStateId(res.data.state_id);
      setCountdown(60);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      toast.success('New code sent!');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error('Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Inputs Logic ────────────────────────────────────────────────

  const handleOtpChange = (idx, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[idx] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // ── Rendering Helpers ───────────────────────────────────────────────

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Email Address</label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>✉️</span>
          <input
            type="email"
            name="email"
            placeholder="om@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label>Password</label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>🔒</span>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <span 
            className={styles.passwordToggle} 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '🙈'}
          </span>
        </div>
      </div>
      <a href="#" className={styles.forgotLink}>Forgot Password?</a>
      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? <div className={styles.spinner}></div> : 'Sign In'}
      </button>
    </form>
  );

  const renderSignupStep1 = () => (
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (!formData.name || !formData.email || formData.password.length < 6) {
            toast.error('Please fill all fields correctly (Password min. 6 chars)');
            return;
          }
          if (formData.role === 'recruiter') setStep(4);
          else setStep(2);
        }} 
        className={styles.stepWrapper}
      >
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>👤</span>
            <input
              type="text"
              name="name"
              placeholder="Om Gupta"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Email Address</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>✉️</span>
            <input
              type="email"
              name="email"
              placeholder="om@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Password</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>I am a...</label>
          <select name="role" value={formData.role} onChange={handleInputChange}>
            <option value="seeker">Job Seeker</option>
            <option value="recruiter">Recruiter</option>
          </select>
        </div>
        <button type="submit" className={styles.submitBtn}>
          Next Step →
        </button>
      </form>
    );

  const renderSignupStep2 = () => (
    <form 
      onSubmit={(e) => { e.preventDefault(); setStep(3); }} 
      className={styles.stepWrapper}
    >
      <div className={styles.formGroup}>
        <label>Professional Skills</label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>🛠️</span>
          <input
            type="text"
            name="skills"
            placeholder="React, Node.js, Python..."
            value={formData.skills}
            onChange={handleInputChange}
          />
        </div>
        <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4}}>Separate with commas</p>
      </div>
      <div className={styles.formGroup}>
        <label>Preferred Roles</label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>🎯</span>
          <input
            type="text"
            name="preferredRoles"
            placeholder="Frontend Developer, Data Analyst..."
            value={formData.preferredRoles}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div style={{display: 'flex', gap: 12}}>
        <button type="button" className={styles.submitBtn} style={{background: '#E5E7EB', color: 'var(--text-main)'}} onClick={() => setStep(1)}>Back</button>
        <button type="submit" className={styles.submitBtn}>Next Step →</button>
      </div>
    </form>
  );

  const renderSignupStep3 = () => (
    <div className={styles.stepWrapper}>
      <label style={{display:'block', marginBottom: 10, fontWeight: 600}}>Upload Resume (PDF)</label>
      <div 
        className={styles.fileUploadArea}
        onClick={() => document.getElementById('resumeInput').click()}
      >
        <input 
          id="resumeInput" 
          type="file" 
          hidden 
          accept=".pdf"
          onChange={(e) => setResumeFile(e.target.files[0])}
        />
        <span className={styles.fileIcon}>📄</span>
        {resumeFile ? (
          <p className={styles.fileName}>{resumeFile.name}</p>
        ) : (
          <p>Click to browse or drag and drop<br/><span>Maximum size: 5MB</span></p>
        )}
      </div>
      <div style={{display: 'flex', gap: 12}}>
        <button className={styles.submitBtn} style={{background: '#E5E7EB', color: 'var(--text-main)'}} onClick={() => setStep(2)}>Back</button>
        <button className={styles.submitBtn} onClick={handleSendOtp} disabled={loading}>
          {loading ? <div className={styles.spinner}></div> : 'Create Account'}
        </button>
      </div>
    </div>
  );

  const renderSignupStep4 = () => (
    <div className={styles.stepWrapper}>
      <div className={styles.header} style={{textAlign: 'center', marginBottom: 20}}>
        <h2>Verify Email</h2>
        <p>We've sent a code to <strong>{formData.email}</strong></p>
      </div>
      <form onSubmit={handleVerifyOtp}>
        <div className={styles.otpInputs}>
          {otpDigits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (otpRefs.current[idx] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
              className={styles.otpBox}
            />
          ))}
        </div>
        <button type="submit" className={styles.submitBtn} disabled={loading || otpDigits.join('').length < OTP_LENGTH}>
          {loading ? <div className={styles.spinner}></div> : 'Verify & Finish'}
        </button>
      </form>
      <p className={styles.resendText}>
        Didn't receive it? 
        <button className={styles.resendBtn} onClick={handleResendOtp} disabled={countdown > 0}>
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Now'}
        </button>
      </p>
    </div>
  );

  return (
    <div className={styles.authContainer}>
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          <div className={styles.logo} onClick={() => navigate('/')}>
            <span className={styles.logoIcon}>💼</span>
            <span>SmartPlacement</span>
          </div>

          <div className={styles.header}>
            <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{mode === 'login' ? 'Sign in to continue your journey' : 'Join thousands of professionals today'}</p>
          </div>

          <div className={styles.toggleContainer}>
            <button 
              className={`${styles.toggleBtn} ${mode === 'login' ? styles.activeToggle : ''}`}
              onClick={() => handleToggleMode('login')}
            >
              Sign In
            </button>
            <button 
              className={`${styles.toggleBtn} ${mode === 'signup' ? styles.activeToggle : ''}`}
              onClick={() => handleToggleMode('signup')}
            >
              Sign Up
            </button>
          </div>

          {mode === 'signup' && (
            <div className={styles.stepper}>
              <div className={`${styles.step} ${step >= 1 ? styles.activeStep : ''} ${step > 1 ? styles.completedStep : ''}`}>1</div>
              <div className={`${styles.step} ${step >= 2 ? styles.activeStep : ''} ${step > 2 ? styles.completedStep : ''}`}>2</div>
              <div className={`${styles.step} ${step >= 3 ? styles.activeStep : ''} ${step > 3 ? styles.completedStep : ''}`}>3</div>
              <div className={`${styles.step} ${step >= 4 ? styles.activeStep : ''}`}>4</div>
            </div>
          )}

          {mode === 'login' ? renderLoginForm() : (
            <>
              {step === 1 && renderSignupStep1()}
              {step === 2 && renderSignupStep2()}
              {step === 3 && renderSignupStep3()}
              {step === 4 && renderSignupStep4()}
            </>
          )}
        </div>
      </div>

      <div className={styles.brandSection}>
        <div className={styles.bgDecoration}></div>
        <div className={styles.bgDecorationBottom}></div>
        <img src={authIllustration} alt="Smart Placement" className={styles.brandIllustration} />
        <div className={styles.brandText}>
          <h1>Connecting Talent with Opportunity</h1>
          <p>The most advanced job portal for modern startups and top-tier professionals. Fast, secure, and smart.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
