import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, CreditCard, BookOpen } from 'lucide-react';
import { useNotificationStore } from '../../stores/useNotificationStore.js';
import './Notification.css';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    
    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fetchNotifications]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const getIcon = (type) => {
    switch(type) {
      case 'payment': return <CreditCard size={16} className="text-secondary" />;
      case 'enrollment': return <BookOpen size={16} className="text-primary" />;
      default: return <Info size={16} className="text-muted" />;
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button className="notification-bell" onClick={toggleDropdown}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={markAllAsRead}>
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {loading && notifications.length === 0 ? (
              <div className="notification-empty">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">No notifications</div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id} 
                  className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => !notif.isRead && markAsRead(notif._id)}
                >
                  <div className="notification-icon-wrap">
                    {getIcon(notif.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="notification-time">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!notif.isRead && <div className="unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
