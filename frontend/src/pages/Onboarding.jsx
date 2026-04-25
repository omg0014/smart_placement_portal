import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import styles from './Onboarding.module.css';
import InputField from '../components/InputField';

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    address: { city: '', state: '', country: '' },
    education: { college: '', degree: '', year: '' },
    experienceLevel: '',
    preferredRoles: '',
    skills: '',
    linkedin: '',
    portfolio: '',
    bio: '',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const isEditing = user?.onboardingCompleted;

  // Sync state with user data (Fixes Edit Profile bug)
  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        address: {
          city: user.address?.city || '',
          state: user.address?.state || '',
          country: user.address?.country || '',
        },
        education: {
          college: user.education?.college || '',
          degree: user.education?.degree || '',
          year: user.education?.year || '',
        },
        experienceLevel: user.experienceLevel || '',
        preferredRoles: user.preferredRoles?.join(', ') || '',
        skills: user.skills?.join(', ') || '',
        linkedin: user.linkedin || '',
        portfolio: user.portfolio || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));
  const handleCancel = () => navigate('/dashboard');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      handleNext();
      return;
    }

    if (!user?.resume && !resumeFile) {
      toast.error('Please upload your resume to complete your profile.');
      return;
    }

    setLoading(true);

    try {
      if (resumeFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('resume', resumeFile);
        await api.post('/applications/upload-resume', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      const profileData = {
        ...formData,
        preferredRoles: formData.preferredRoles.split(',').map((r) => r.trim()).filter(Boolean),
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      };

      const res = await api.put('/profile', profileData);
      
      updateUser(res.data.user);
      toast.success(isEditing ? 'Profile updated successfully!' : 'Welcome aboard! Your profile is ready.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.onboardingPage}>
      <div className={styles.cardContainer}>
        
        <div className={styles.header}>
          <h2>{isEditing ? 'Edit Profile' : 'Complete Your Profile'}</h2>
          <p>{isEditing ? 'Update your professional details below.' : 'Let recruiters know who you are and what you can do.'}</p>
        </div>

        {/* Stepper */}
        <div className={styles.stepperContainer}>
          <div className={`${styles.stepIndicator} ${step >= 1 ? styles.active : ''}`}>
            <div className={styles.stepCircle}>1</div>
            <span className={styles.stepLabel}>Personal Info</span>
          </div>
          <div className={`${styles.stepLine} ${step >= 2 ? styles.activeLine : ''}`}></div>
          <div className={`${styles.stepIndicator} ${step >= 2 ? styles.active : ''}`}>
            <div className={styles.stepCircle}>2</div>
            <span className={styles.stepLabel}>Professional Info</span>
          </div>
          <div className={`${styles.stepLine} ${step >= 3 ? styles.activeLine : ''}`}></div>
          <div className={`${styles.stepIndicator} ${step >= 3 ? styles.active : ''}`}>
            <div className={styles.stepCircle}>3</div>
            <span className={styles.stepLabel}>Links & Bio</span>
          </div>
        </div>

        <form className={styles.formContent} onSubmit={handleSubmit}>
          
          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.row}>
                <InputField label="Full Name" value={user?.name || ''} disabled />
                <InputField label="Email" type="email" value={user?.email || ''} disabled />
              </div>
              <InputField 
                label="Phone Number" 
                type="tel" 
                required 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              />
              <div className={styles.row}>
                <InputField 
                  label="City" 
                  required 
                  value={formData.address.city} 
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} 
                />
                <InputField 
                  label="State" 
                  required 
                  value={formData.address.state} 
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} 
                />
              </div>
              <InputField 
                label="Country" 
                required 
                value={formData.address.country} 
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })} 
              />
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <InputField 
                label="College / University" 
                required 
                value={formData.education.college} 
                onChange={(e) => setFormData({ ...formData, education: { ...formData.education, college: e.target.value } })} 
              />
              <div className={styles.row}>
                <InputField 
                  label="Degree" 
                  placeholder="e.g. B.Tech"
                  required 
                  value={formData.education.degree} 
                  onChange={(e) => setFormData({ ...formData, education: { ...formData.education, degree: e.target.value } })} 
                />
                <InputField 
                  label="Graduation Year" 
                  placeholder="e.g. 2024"
                  required 
                  value={formData.education.year} 
                  onChange={(e) => setFormData({ ...formData, education: { ...formData.education, year: e.target.value } })} 
                />
              </div>
              <InputField 
                label="Experience Level" 
                type="select"
                required 
                options={[
                  { value: 'Fresher', label: 'Fresher (0 years)' },
                  { value: 'Experienced', label: 'Experienced (1+ years)' }
                ]}
                value={formData.experienceLevel} 
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })} 
              />
              <InputField 
                label="Preferred Job Roles" 
                placeholder="e.g. Frontend Developer, Data Scientist"
                required 
                helpText="Separate multiple roles with commas"
                value={formData.preferredRoles} 
                onChange={(e) => setFormData({ ...formData, preferredRoles: e.target.value })} 
              />
              <InputField 
                label="Skills" 
                placeholder="e.g. React, Node.js, Python"
                required 
                helpText="Separate multiple skills with commas"
                value={formData.skills} 
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })} 
              />
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <InputField 
                label="LinkedIn Profile URL" 
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedin} 
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} 
              />
              <InputField 
                label="Portfolio / GitHub URL" 
                type="url"
                placeholder="https://github.com/..."
                value={formData.portfolio} 
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })} 
              />
              <InputField 
                label="Short Bio" 
                type="textarea"
                placeholder="Tell us a little bit about yourself, your background, and your career goals."
                value={formData.bio} 
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })} 
              />
              <InputField 
                label="Resume (PDF)" 
                type="file"
                required={!user?.resume}
                onChange={(e) => setResumeFile(e.target.files[0])} 
                helpText={user?.resume && !resumeFile ? "You already have a resume uploaded. Uploading a new one will replace it." : ""}
              />
            </div>
          )}

          <div className={styles.actionsContainer}>
            <div className={styles.leftActions}>
              {step > 1 && (
                <button type="button" className={styles.btnSecondary} onClick={handlePrev}>
                  Back
                </button>
              )}
              {isEditing && step === 1 && (
                <button type="button" className={styles.btnDanger} onClick={handleCancel}>
                  Cancel Edit
                </button>
              )}
            </div>
            
            <div className={styles.rightActions}>
              {step < 3 ? (
                <button type="submit" className={styles.btnPrimary}>
                  Next Step
                </button>
              ) : (
                <button type="submit" className={styles.btnPrimary} disabled={loading}>
                  {loading ? (
                    <span className={styles.loader}>Saving...</span>
                  ) : (
                    isEditing ? 'Save Changes' : 'Finish Profile'
                  )}
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Onboarding;
