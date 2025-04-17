import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Sidebar.css';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    console.log(userInfo);  // Kiểm tra dữ liệu người dùng
    if (userInfo) {
      setUser(userInfo);
    }
  }, []);

  // Chuyển hướng đến trang User khi click vào avatar hoặc tên người dùng
  const handleUserClick = () => {
    navigate('/user');
  };

  return (
    <div className="sidebar">
      <h2>Social App</h2>
      <a href="/">🏠 Home</a>
      <a href="#">🔍 Tìm kiếm</a>
      <a href="/add-post">➕ Thêm bài viết</a>
      <a href="#">⭐ Yêu thích</a>
      <a href="/notifications">🔔 Thông báo</a>

      {/* Hiển thị avatar và tên người dùng nếu đã đăng nhập */}
      {user && (
        <div className="user-info" onClick={handleUserClick}>
          <img src={user.avatar || 'https://via.placeholder.com/40'} alt="Avatar" className="user-avatar" />
          <span className="user-name">{user.name || 'Người dùng'}</span>
        </div>
      )}

      {/* Đưa các mục này xuống dưới cùng */}
      <div className="bottom-links">
        <a href="#">⚙️ Cài đặt</a>
      </div>
    </div>
  );
};

export default Sidebar;
