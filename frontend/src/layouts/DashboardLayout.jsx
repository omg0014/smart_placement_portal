import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useAuth } from '../context/AuthContext';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const layoutClass = `${styles.layout} ${user?.role === 'seeker' ? styles.seekerTheme : ''} ${user?.role === 'recruiter' ? styles.recruiterTheme : ''}`;

  return (
    <div className={layoutClass}>
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      
      <div className={styles.mainContainer}>
        <div className={styles.mainContent}>
          <TopNav toggleSidebar={toggleSidebar} />
          <main className={styles.pageContent}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
