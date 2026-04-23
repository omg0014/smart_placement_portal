import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Briefcase, Bookmark, FileText, Users, LogOut, X } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user, logout } = useAuth();

  const seekerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { to: '/jobs', label: 'Find Jobs', icon: <Briefcase size={20} /> },
    { to: '/applications', label: 'My Applications', icon: <FileText size={20} /> },
    { to: '/saved-jobs', label: 'Saved Jobs', icon: <Bookmark size={20} /> },
  ];

  const recruiterLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { to: '/post-job', label: 'Post Job', icon: <FileText size={20} /> },
    { to: '/applications', label: 'All Applicants', icon: <Users size={20} /> }, // Using generic view
  ];

  const links = user?.role === 'recruiter' ? recruiterLinks : seekerLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={closeSidebar}></div>}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🚀</div>
          <span>Smart Job</span>
          {isOpen && <button className={styles.closeBtn} onClick={closeSidebar}><X size={20} /></button>}
        </div>

        <nav className={styles.nav}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={closeSidebar}
            >
              <span className={styles.icon}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.logoutBtn} onClick={logout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
