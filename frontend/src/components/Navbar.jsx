import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        <Link to="/" className={styles.logo}>
          Smart Job Portal
        </Link>

        <ul className={styles.navLinks}>
          <li><Link to="/jobs">Jobs</Link></li>

          {!user && (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </>
          )}

          {user && (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>

              {user.role === 'recruiter' && (
                <li><Link to="/post-job">Post Job</Link></li>
              )}

              {user.role === 'seeker' && (
                <>
                  <li><Link to="/applications">My Applications</Link></li>
                  <li><Link to="/saved-jobs">Saved Jobs</Link></li>
                </>
              )}

              <li className={styles.userInfo}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.roleBadge}>{user.role}</span>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
