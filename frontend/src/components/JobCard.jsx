import { useNavigate } from 'react-router-dom';
import styles from './JobCard.module.css';

const JobCard = ({ job, isSaved = false }) => {
  const navigate = useNavigate();

  // format date nicely
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Extract skills from requirements string
  const getSkills = (reqs) => {
    if (!reqs) return [];
    return reqs.split(',').map(s => s.trim()).filter(s => s.length > 0).slice(0, 3);
  };

  const skills = getSkills(job.requirements);

  return (
    <div 
      className={`${styles.jobCard} ${isSaved ? styles.savedJobCard : ''}`} 
      onClick={() => navigate(`/jobs/${job._id}`)}
    >
      {isSaved && (
        <div className={styles.savedBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          Saved
        </div>
      )}

      {/* Header: Logo + Info */}
      <div className={styles.cardHeader}>
        <div className={styles.companyLogo}>
          {job.company.charAt(0).toUpperCase()}
        </div>
        <div className={styles.headerInfo}>
          <h3 className={styles.jobTitle}>{job.title}</h3>
          <p className={styles.jobCompany}>{job.company}</p>
        </div>
      </div>

      {/* Tags row */}
      <div className={styles.tagsRow}>
        <span className={`${styles.badge} ${styles.typeBadge}`}>{job.jobType}</span>
        {skills.map((skill, idx) => (
          <span key={idx} className={`${styles.badge} ${styles.skillBadge}`}>{skill}</span>
        ))}
      </div>

      {/* Location & Salary row */}
      <div className={styles.jobDetails}>
        <span className={styles.detailItem}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {job.location}
        </span>
        <span className={`${styles.detailItem} ${styles.salaryText}`}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          {job.salary}
        </span>
      </div>

      {/* Footer: date + button */}
      <div className={styles.cardFooter}>
        <span className={styles.postedDate}>
          Posted {formatDate(job.createdAt)}
        </span>
        <button className={styles.viewBtn} onClick={(e) => {
          e.stopPropagation();
          navigate(`/jobs/${job._id}`);
        }}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default JobCard;
