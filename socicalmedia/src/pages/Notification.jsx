import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';  // Sidebar import
import '../style/Notification.css';  // Tùy chỉnh CSS

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Trạng thái loading

  useEffect(() => {
    axios.get('http://localhost:8000/api/notifications')
      .then(res => {
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
        } else {
          console.log("Không có thông báo nào.");
          setNotifications([]);
        }
      })
      .catch(err => {
        console.error("Lỗi khi tải thông báo:", err);
      })
      .finally(() => setIsLoading(false));  // Đặt loading về false khi dữ liệu đã tải xong
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(noti => 
      noti.id === id ? { ...noti, is_read: true } : noti
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(noti => noti.id !== id));
  };

  return (
    <div className="notification-container d-flex">
      <Sidebar /> {/* Gắn Sidebar vào */}
      <div className="main-content p-4 w-100">
        <h2 className="text-center mb-4">🔔 Danh sách thông báo</h2>

        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-center">Không có thông báo nào.</p>
        ) : (
          <div className="timeline">
            {notifications.map((noti, index) => (
              <div key={noti.id} className="timeline-item">
                <div className="timeline-date">
                  <span>{new Date(noti.created_at).toLocaleDateString()}</span>
                  <span className="time">{new Date(noti.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`notification-item ${noti.is_read ? 'read' : 'unread'}`}>
                  <div className="notification-header">
                    <div className="user-info">
                      <img 
                        src={noti.user && noti.user.profilepicture ? noti.user.profilepicture : '/path/to/default-avatar.png'} 
                        alt="Avatar" 
                        className="avatar" 
                      />
                      <span className="username">{noti.user ? noti.user.username : 'Người dùng không xác định'}</span>
                    </div>
                    <span className={`status-icon ${noti.is_read ? 'read-icon' : 'unread-icon'}`}>
                      {noti.is_read ? '✅' : '🔔'}
                    </span>
                  </div>
                  <div className="notification-message">
                    <span className="message-title">{noti.title || 'Thông báo mới'}</span>
                    <span className="message">{noti.notification_content}</span>
                  </div>
                  <div className="notification-actions">
                    {!noti.is_read && (
                      <button 
                        className="action-btn mark-read-btn" 
                        onClick={() => markAsRead(noti.id)}
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => deleteNotification(noti.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}