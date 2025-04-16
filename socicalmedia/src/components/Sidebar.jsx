// components/Sidebar.js
import React from 'react';
import '../style/Sidebar.css'; // Tạo file này để chứa CSS riêng nếu cần

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Social App</h2>
      <a href="/">🏠 Home</a>
      <a href="#">🔍 Tìm kiếm</a>
      <a href="/add-post">➕ Thêm bài viết</a>
      <a href="#">⭐ Yêu thích</a>
      <a href="/notifications">🔔 Thông báo</a>
      <a href="#">👤 User</a>
      {/* Đưa các mục này xuống dưới cùng */}
      <div className="bottom-links">
        <a href="#">⚙️ Cài đặt</a>
      </div>
    </div>
  );
};

export default Sidebar;
