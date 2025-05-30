import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/Notification.css';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  const title = "Notification";
  const letters = title.split('');

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 1800);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (!userId) {
      setStatusMessage('Vui lòng đăng nhập để xem thông báo.');
      navigate('/login');
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/notifications/${userId}`);
        console.log('Notifications fetched:', response.data);
        setNotifications(response.data);
        setUnreadCount(response.data.filter(n => !n.is_read).length);
        setStatusMessage('');
      } catch (error) {
        console.error('Error fetching notifications:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        setStatusMessage(
            error.response?.status === 404
                ? 'Không tìm thấy thông báo.'
                : 'Có lỗi xảy ra khi tải thông báo.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId, navigate]);

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  const markAsRead = async (id) => {
    setLoading(true);
    try {
      await axios.post(`/notifications/${id}/read`, { user_id: userId });
      setNotifications(notifications.map(notification =>
          notification.id === id ? { ...notification, is_read: true } : notification
      ));
      setUnreadCount(prev => prev - 1);
      setStatusMessage('Thông báo đã được đánh dấu đã đọc.');
    } catch (error) {
      console.error('Error marking notification as read:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setStatusMessage('Có lỗi khi đánh dấu thông báo đã đọc.');
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await axios.post('/notifications/mark-all-read', { user_id: userId });
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      setUnreadCount(0);
      setStatusMessage('Tất cả thông báo đã được đánh dấu đã đọc.');
    } catch (error) {
      console.error('Error marking all notifications as read:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setStatusMessage('Có lỗi khi đánh dấu tất cả thông báo đã đọc.');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    if (!userId) {
      setStatusMessage('Vui lòng đăng nhập để thay đổi cài đặt thông báo.');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('/notifications/settings', {
        user_id: userId,
        enabled: !isNotificationsEnabled,
      });
      setIsNotificationsEnabled(!isNotificationsEnabled);
      setStatusMessage(isNotificationsEnabled ? 'Đã tắt thông báo' : 'Đã bật thông báo');
    } catch (error) {
      console.error('Error toggling notifications:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setStatusMessage(
          error.response?.status === 404
              ? 'Không tìm thấy endpoint cài đặt thông báo.'
              : error.response?.status === 401
                  ? 'Không có quyền thay đổi cài đặt thông báo.'
                  : 'Có lỗi khi thay đổi cài đặt thông báo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/notifications/${id}`, { data: { user_id: userId } });
      setNotifications(notifications.filter(notification => notification.id !== id));
      setUnreadCount(prev => prev - 1);
      setStatusMessage('Thông báo đã được xóa.');
    } catch (error) {
      console.error('Error deleting notification:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setStatusMessage('Có lỗi khi xóa thông báo.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!userId) {
      setStatusMessage('Vui lòng đăng nhập để xem thông báo.');
      navigate('/login');
      return;
    }
    if (notification.notifiable_id) {
      if (notification.notifiable_type === 'post') {
        navigate('/home', {
          state: {
            postId: notification.notifiable_id,
            openComments: notification.notification_content.includes('bình luận')
          }
        });
        markAsRead(notification.id);
      } else if (notification.notifiable_type === 'user') {
        navigate(`/users/${notification.notifiable_id}`);
        markAsRead(notification.id);
      }
    }
  };

  if (showIntro) {
    return (
        <div className="notification-intro-container">
          <div className="notification-bell">🔔</div>
          <div className="notification-intro-text">
            {letters.map((letter, index) => (
                <span
                    key={index}
                    className="notification-intro-letter"
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
            ))}
          </div>
        </div>
    );
  }

  return (
      <div className="container">
        <Header />
        <Sidebar />
        <div className="notifications-wrapper">
          <div className="notifications-container">
            <div className="notifications-header">
              <div className="fancy-container">
                <div className="fancy-text">Thông báo</div>
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
              </div>
              <div className="header-actions">
                <button
                    onClick={markAllAsRead}
                    className="action-btn mark-all-btn"
                    disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
                </button>
                <button
                    onClick={toggleNotifications}
                    className="action-btn toggle-btn"
                    disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : isNotificationsEnabled ? 'Tắt thông báo' : 'Bật thông báo'}
                </button>
              </div>
            </div>
            {statusMessage && <div className="status-message">{statusMessage}</div>}
            <ul className="notifications-list">
              {notifications.length > 0 ? (
                  notifications.map(notification => (
                      <li
                          key={notification.id}
                          className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
                          onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="notification-content">
                          <div className="notification-icon">
                            {notification.notifiable_type === 'post' && notification.notification_content.includes('thả cảm xúc') ? (
                                {
                                  like: '👍',
                                  love: '❤️',
                                  haha: '😂',
                                  wow: '😲',
                                  sad: '😢',
                                  angry: '😡',
                                }[notification.notification_content.match(/thả cảm xúc (\w+)/)?.[1]] || '😊'
                            ) : notification.notifiable_type === 'post' && notification.notification_content.includes('bình luận') ? '💬' :
                                notification.notifiable_type === 'user' ? '👤' : '🔔'}
                          </div>
                          <div className="notification-text">
                            <p>{notification.notification_content}</p>
                            <span className="notification-time">{formatTime(notification.created_at)}</span>
                          </div>
                        </div>
                        <div className="notification-actions">
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="action-btn mark-read-btn"
                              disabled={loading}
                          >
                            {notification.is_read ? 'Đã đọc' : 'Đánh dấu đã đọc'}
                          </button>
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="action-btn delete-btn"
                              disabled={loading}
                          >
                            Xóa
                          </button>
                        </div>
                      </li>
                  ))
              ) : (
                  <p className="no-notifications">Không có thông báo mới</p>
              )}
            </ul>
          </div>
        </div>
      </div>
  );
};

export default NotificationComponent;