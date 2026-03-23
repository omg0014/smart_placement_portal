import { useNavigate } from 'react-router-dom';
import styles from './JobCard.module.css';

const JobCard = ({ job }) => {
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

  return (
    <div className={styles.jobCard} onClick={() => navigate(`/jobs/${job._id}`)}>
      {/* Header: title + job type badge */}
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.jobTitle}>{job.title}</h3>
          <p className={styles.jobCompany}>{job.company}</p>
        </div>
        <span className={styles.jobTypeBadge}>{job.jobType}</span>
      </div>

      {/* Location & Salary row */}
      <div className={styles.jobDetails}>
        <span className={styles.jobLocation}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {job.location}
        </span>
        <span className={styles.jobSalary}>
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
        <button className="btn btn-primary btn-small" onClick={(e) => {
          e.stopPropagation();
          navigate(`/jobs/${job._id}`);
        }}>
          View Details →
        </button>
      </div>
    </div>
  );
};

export default JobCard;
