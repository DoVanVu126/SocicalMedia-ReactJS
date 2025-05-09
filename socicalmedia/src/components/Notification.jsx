import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style/Notification.css';

const NotificationComponent = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Fetch notifications when component mounts
    setLoading(true);
    axios.get(`http://localhost:8000/notifications/${userId}`)
      .then(response => {
        setNotifications(response.data);
      })
      .catch(error => {
        console.error(error);
        setStatusMessage('Có lỗi xảy ra khi tải thông báo.');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const markAsRead = (id) => {
    axios.post(`http://localhost:8000/notifications/${id}/read`)
      .then(response => {
        setNotifications(notifications.map(notification =>
          notification.id === id ? { ...notification, is_read: true } : notification
        ));
      })
      .catch(error => console.error(error));
  };

  const markAllAsRead = () => {
    setLoading(true);
    axios.post('http://localhost:8000/notifications/mark-all-read', { user_id: userId })
      .then(response => {
        setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
        setStatusMessage('Tất cả thông báo đã được đánh dấu đã đọc.');
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const toggleNotifications = () => {
    setLoading(true);
    axios.post('http://localhost:8000/notifications/settings', { user_id: userId, enabled: !isNotificationsEnabled })
      .then(response => {
        setIsNotificationsEnabled(!isNotificationsEnabled);
        setStatusMessage(isNotificationsEnabled ? 'Đã tắt thông báo' : 'Đã bật thông báo');
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  const deleteNotification = (id) => {
    setLoading(true);
    axios.delete(`http://localhost:8000/notifications/${id}`)
      .then(response => {
        setNotifications(notifications.filter(notification => notification.id !== id));
        setStatusMessage('Thông báo đã được xóa');
      })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  return (
    <div className="notifications-container">
      <h2>Thông báo</h2>
      
      {statusMessage && <div className="status-message">{statusMessage}</div>}

      <button onClick={markAllAsRead} className="mark-all-read-btn" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
      </button>

      <button onClick={toggleNotifications} className="toggle-settings-btn" disabled={loading}>
        {loading ? 'Đang xử lý...' : isNotificationsEnabled ? 'Tắt thông báo' : 'Bật thông báo'}
      </button>

      <ul className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <li key={notification.id} className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}>
              <p>{notification.notification_content}</p>
              <button 
                onClick={() => markAsRead(notification.id)} 
                className="mark-as-read-btn">
                {notification.is_read ? 'Đã đọc' : 'Đánh dấu đã đọc'}
              </button>
              <button 
                onClick={() => deleteNotification(notification.id)} 
                className="delete-btn">
                Xóa
              </button>
            </li>
          ))
        ) : (
          <p>Không có thông báo mới</p> 
        )}
      </ul> 
    </div>
  );
};

export default NotificationComponent;
