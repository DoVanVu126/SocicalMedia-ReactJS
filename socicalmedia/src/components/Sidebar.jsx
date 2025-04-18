// src/components/Sidebar.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Sidebar.css';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleUserClick = () => {
    navigate('/user');
  };

  if (!user) {
    return null; // hoặc bạn có thể hiển thị placeholder
  }

  // Xây dựng URL avatar
  const avatarUrl = user.profilepicture
    ? `http://localhost:8000/storage/images/${user.profilepicture}`
    : '/default-avatar.png'; // đặt default-avatar.png trong public/

  return (
    <div className="sidebar">
      <h2>Social App</h2>
      <a href="/">🏠 Home</a>
      <a href="#">🔍 Tìm kiếm</a>
      <a href="/add-post">➕ Thêm bài viết</a>
      <a href="#">⭐ Yêu thích</a>
      <a href="/notifications">🔔 Thông báo</a>

      <div className="user-info" onClick={handleUserClick}>
        <img
          src={avatarUrl}
          alt="Avatar"
          className="user-avatar"
          onError={e => { e.currentTarget.src = '/default-avatar.png'; }}
        />
        <span className="user-name">{user.username}</span>
      </div>

      <div className="bottom-links">
        <a href="#">⚙️ Cài đặt</a>
      </div>
    </div>
  );
};

export default Sidebar;
