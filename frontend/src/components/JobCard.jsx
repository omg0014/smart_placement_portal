import { useNavigate } from 'react-router-dom';
import styles from './JobCard.module.css';

const JobCard = ({ job, isSaved = false }) => {
  const navigate = useNavigate();

  // Pick a shade based on job ID
  const shades = [
    styles.shadeLavender,
    styles.shadeMint,
    styles.shadePink,
    styles.shadeIndigo,
    styles.shadePeach,
    styles.shadeGray
  ];
  
  // Use a simple hash of the job ID to pick a consistent shade
  const shadeIndex = job._id ? (job._id.charCodeAt(job._id.length - 1) % shades.length) : 0;
  const selectedShade = shades[shadeIndex];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getBrief = (desc) => {
    if (!desc) return '';
    return desc.length > 90 ? desc.substring(0, 90) + '...' : desc;
  };

  return (
    <div className={`${styles.premiumJobCard} ${selectedShade}`}>
      <div className={styles.cardHeader}>
        <div className={styles.companyLogoWrapper}>
          <div className={styles.companyLogo}>
            {job.company.charAt(0).toUpperCase()}
          </div>
        </div>
        <button className={`${styles.bookmarkBtn} ${isSaved ? styles.isBookmarked : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </button>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.jobTitle}>{job.title}</h3>
        <p className={styles.jobBrief}>{getBrief(job.description)}</p>

        <div className={styles.pillRow}>
          <span className={styles.pillBadge}>{job.jobType}</span>
          <span className={styles.pillBadge}>{job.location}</span>
          <span className={styles.pillBadge}>₹{job.salary}</span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button 
          className={styles.secondaryBtn} 
          onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job._id}`); }}
        >
          Details
        </button>
        <button 
          className={styles.primaryBtn}
          onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job._id}`); }}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default JobCard;
