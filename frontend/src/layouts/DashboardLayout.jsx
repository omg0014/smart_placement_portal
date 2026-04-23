import { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      
      <div className={styles.mainContent}>
        <TopNav toggleSidebar={toggleSidebar} />
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
