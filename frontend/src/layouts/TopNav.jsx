import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import io from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import styles from './TopNav.module.css';

// Socket connection instance outside component to persist across minimal re-renders
let socket;

const TopNav = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!user) return;

    // 1. Fetch initial DB Notifications
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifs();

    // 2. Connect to Socket.io
    const SOCKET_URL = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5002';

    socket = io(SOCKET_URL, { withCredentials: true });

    socket.on('connect', () => {
      socket.emit('register', user._id || user.id);
    });

    socket.on('new_notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      toast(notif.title, {
        icon: '🔔',
      });
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
      </div>

      <div className={styles.right}>
        <div className={styles.notificationWrapper} ref={notifRef}>
          <button 
            className={styles.iconBtn} 
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className={styles.notificationDropdown}>
              <div className={styles.dropdownHeader}>
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <span className={styles.clearBtn} onClick={handleMarkAllRead}>
                    Mark all as read
                  </span>
                )}
              </div>
              <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div className={styles.notifItem} style={{ justifyContent: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif._id} 
                      className={styles.notifItem} 
                      style={{ opacity: notif.isRead ? 0.6 : 1 }}
                      onClick={(e) => { 
                        if (!notif.isRead) handleMarkAsRead(notif._id, e); 
                      }}
                    >
                      {!notif.isRead && <div className={styles.notifDot}></div>}
                      {notif.isRead && <CheckCircle2 size={16} color="var(--accent)" style={{marginTop: 4, flexShrink:0}} />}
                      <div className={styles.notifText}>
                        <p><strong>{notif.title}</strong>: {notif.message}</p>
                        <span>{formatDistanceToNow(new Date(notif.createdAt))} ago</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={styles.info}>
            <span className={styles.name}>{user?.name || 'User'}</span>
            <span className={styles.role}>{user?.role || 'Guest'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
