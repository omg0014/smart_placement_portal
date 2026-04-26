import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import styles from './Applications.module.css';

// recruiter page: view all applicants for a specific job
const Applicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // shade list for multi-colored cards
  const shades = [
    styles.shadeLavender,
    styles.shadeMint,
    styles.shadePink,
    styles.shadeIndigo,
    styles.shadePeach,
    styles.shadeGray
  ];

  // dynamically determine the base URL for the backend
  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5002';

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJobTitle(jobRes.data.job.title);

        const res = await api.get(`/applications/job/${jobId}`);
        setApplicants(res.data.applications);
      } catch (error) {
        console.error('Failed to fetch applicants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setApplicants(
        applicants.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app
        )
      );
      // Also update modal if open
      if (selectedApp && selectedApp._id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const openModal = (app) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApp(null);
  };

  if (loading) return <div className="loading">Loading applicants...</div>;

  return (
    <div className={styles.applicationsPage}>
      <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Dashboard
      </button>

      <div className="page-header">
        <h1>Applicants for "{jobTitle}"</h1>
        <p>Review and manage candidate applications ({applicants.length} total)</p>
      </div>

      {applicants.length === 0 ? (
        <div className="empty-state">
          <h3>No applicants yet</h3>
          <p>Check back later for new applications</p>
        </div>
      ) : (
        <div className={styles.applicantGrid}>
          {applicants.map((app, index) => {
            const shadeClass = shades[index % shades.length];
            return (
              <div key={app._id} className={`${styles.premiumApplicantCard} ${shadeClass}`} onClick={() => openModal(app)}>
                <div className={styles.cardHeaderArea}>
                  <div className={styles.applicantMain}>
                    <div className={styles.recruiterAvatarCircle}>
                      {app.applicant?.name?.split(' ').map(n => n[0]).join('') || '?'}
                    </div>
                    <div className={styles.applicantTitle}>
                      <h4>{app.applicant?.name || 'Unknown'}</h4>
                      <p>{app.applicant?.email}</p>
                    </div>
                  </div>
                  <div className={styles.statusPillArea}>
                    <span className={`${styles.statusPill} ${styles[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                <div className={styles.applicantDetailSection}>
                   <div className={styles.infoRow}>
                      <div className={styles.infoBox}>
                         <span className={styles.infoLabel}>Location</span>
                         <span className={styles.infoValue}>📍 {app.applicant?.address?.city || 'Remote'}</span>
                      </div>
                      <div className={styles.infoBox}>
                         <span className={styles.infoLabel}>Experience</span>
                         <span className={styles.infoValue}>💼 {app.applicant?.experienceLevel || 'Fresher'}</span>
                      </div>
                   </div>

                   {app.applicant?.skills?.length > 0 && (
                     <div className={styles.skillsArea}>
                        <div className={styles.skillList}>
                           {app.applicant.skills.slice(0, 4).map((skill, i) => (
                             <span key={i} className={styles.skillTag}>{skill}</span>
                           ))}
                           {app.applicant.skills.length > 4 && (
                             <span className={styles.skillTag}>+{app.applicant.skills.length - 4} more</span>
                           )}
                        </div>
                     </div>
                   )}

                   {app.applicant?.bio && (
                     <p className={styles.applicantBioBrief}>
                       "{app.applicant.bio.length > 90 ? app.applicant.bio.substring(0, 90) + '...' : app.applicant.bio}"
                     </p>
                   )}
                </div>

                <div className={styles.recruiterCardFooter} onClick={(e) => e.stopPropagation()}>
                   <button className={styles.viewDetailsBtn} onClick={() => openModal(app)}>
                     View Profile
                   </button>
                   <div className={styles.statusDropdown}>
                      <select
                        className={styles.statusSelect}
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Details Modal */}
      {isModalOpen && selectedApp && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={closeModal}>×</button>
            
            <div className={styles.modalHeader}>
               <div className={styles.modalAvatar}>
                  {selectedApp.applicant?.name?.split(' ').map(n => n[0]).join('') || '?'}
               </div>
               <div className={styles.modalHeaderText}>
                  <h2>{selectedApp.applicant?.name}</h2>
                  <p>{selectedApp.applicant?.email} • {selectedApp.applicant?.phone}</p>
               </div>
            </div>

            <div className={styles.modalBody}>
               <div className={styles.modalSection}>
                  <h3>About Candidate</h3>
                  <p className={styles.modalBio}>{selectedApp.applicant?.bio || 'No bio provided.'}</p>
               </div>

               <div className={styles.modalGrid}>
                  <div className={styles.modalInfoBlock}>
                     <label>Education</label>
                     <p>{selectedApp.applicant?.education?.degree} - {selectedApp.applicant?.education?.fieldOfStudy}</p>
                     <p className={styles.subInfo}>{selectedApp.applicant?.education?.institution}</p>
                  </div>
                  <div className={styles.modalInfoBlock}>
                     <label>Experience Level</label>
                     <p>{selectedApp.applicant?.experienceLevel}</p>
                  </div>
               </div>

               <div className={styles.modalSection}>
                  <h3>Technical Skills</h3>
                  <div className={styles.modalSkillsList}>
                     {selectedApp.applicant?.skills?.map((skill, i) => (
                        <span key={i} className={styles.modalSkillTag}>{skill}</span>
                     ))}
                  </div>
               </div>

               <div className={styles.modalSection}>
                  <h3>Professional Links</h3>
                  <div className={styles.modalLinks}>
                     {selectedApp.applicant?.linkedin && (
                       <a href={selectedApp.applicant.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                     )}
                     {selectedApp.applicant?.portfolio && (
                       <a href={selectedApp.applicant.portfolio} target="_blank" rel="noreferrer">Portfolio</a>
                     )}
                     {selectedApp.applicant?.resume && (
                       <a 
                         href={selectedApp.applicant.resume.startsWith('http') ? selectedApp.applicant.resume : `${API_BASE_URL}/uploads/resumes/${selectedApp.applicant.resume}`}
                         target="_blank" 
                         rel="noreferrer"
                         className={styles.modalResumeBtn}
                       >
                         View Full Resume
                       </a>
                     )}
                  </div>
               </div>
            </div>

            <div className={styles.modalFooter}>
               <div className={styles.modalStatusArea}>
                  <label>Update Application Status:</label>
                  <select
                    className={styles.modalStatusSelect}
                    value={selectedApp.status}
                    onChange={(e) => handleStatusChange(selectedApp._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applicants;
