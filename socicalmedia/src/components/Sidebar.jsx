import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const userData = JSON.parse(stored);
      setUser(userData);

      // Fetch unread notification count
      const fetchUnreadCount = async () => {
        try {
          const response = await axios.get(`/notifications/${userData.id}`);
          const unread = response.data.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        } catch (error) {
          console.error("Error fetching unread notifications:", {
            message: error.message,
            status: error.response?.status,
          });
        }
      };

      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // Initialize Ripple Effect for links
    const links = document.querySelectorAll(
      ".link-notifications, .link-game"
    );
    links.forEach((link) => {
      link.style.position = "relative";
      link.style.overflow = "hidden";
      link.addEventListener("click", (e) => {
        const rect = link.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        link.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      });
    });

    // Cleanup
    return () => {
      links.forEach((link) => {
        link.replaceWith(link.cloneNode(true));
      });
    };
  }, [unreadCount]);

  const handleUserClick = () => {
    navigate("/user");
  };

  if (!user) {
    return null;
  }

  return (
    <aside id="sidebar" className="sidebar">
      <ul className="sidebar-nav" id="sidebar-nav">
        <li className="nav-item item-home">
          <a className="nav-link collapsed link-home" href="/home">
            <i className="bi bi-grid icon-home"></i>
            <span className="text-home">Trang chủ</span>
          </a>
        </li>

        <li className="nav-item item-search">
          <a className="nav-link collapsed link-search" href="/search">
            <i className="bi bi-search icon-search"></i>
            <span className="text-search">Tìm kiếm</span>
          </a>
        </li>

        <li className="nav-item item-add-post">
          <a className="nav-link collapsed link-add-post" href="/add-post">
            <i className="bi bi-newspaper icon-add-post"></i>
            <span className="text-add-post">Thêm bài viết</span>
          </a>
        </li>

        <li className="nav-item item-story">
          <a className="nav-link collapsed link-story" href="/story">
            <i className="bi bi-camera icon-story"></i>
            <span className="text-story">Story</span>
          </a>
        </li>

        <li className="nav-item item-heart">
          <a className="nav-link collapsed link-heart" href="#">
            <i className="bi bi-heart icon-heart"></i>
            <span className="text-heart">Yêu thích</span>
          </a>
        </li>

        <li className="nav-item item-notifications">
          <a
            className="nav-link collapsed link-notifications"
            href={`/notifications/${user.id}`}
          >
            <i className="bi bi-bell icon-notifications"></i>
            <span className="text-notifications">Thông báo</span>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </a>
        </li>

        <li className="nav-item item-game">
          <a className="nav-link collapsed link-game" href="/game">
            <i className="bi bi-joystick icon-game"></i>
            <span className="text-game">Mini Game</span>
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link collapsed" href="/friend-request/list">
            <i className="bi bi-people"></i>
            <span>Bạn bè</span>
          </a>
        </li>

        <li className="nav-item">
          <a
            className="nav-link collapsed"
            data-bs-target="#users-nav"
            data-bs-toggle="collapse"
            href="#"
          >
            <i className="bi bi-person-vcard"></i>
            <span>Quản lí tài khoản</span>
            <i className="bi bi-chevron-down ms-auto"></i>
          </a>
          <ul
            id="users-nav"
            className="nav-content collapse"
            data-bs-parent="#sidebar-nav"
          >
            <li>
              <a className="link-user-list" href="/admin/users/list">
                <i className="bi bi-circle icon-user-list"></i>
                <span className="text-user-list">Danh sách tài khoản</span>
              </a>
            </li>
            <li>
              <a className="link-user-create" href="/admin/users/create">
                <i className="bi bi-circle icon-user-create"></i>
                <span className="text-user-create">Thêm mới tài khoản</span>
              </a>
            </li>
          </ul>
        </li>

        <li className="nav-heading">Trang</li>

        <li className="nav-item item-settings">
          <a className="nav-link collapsed link-settings" href="#">
            <i className="bi bi-gear icon-settings"></i>
            <span className="text-settings">Cài đặt</span>
          </a>
        </li>

        <li className="nav-item item-profile">
          <a
            className="nav-link collapsed link-profile"
            href={`/users/${user.id}`}
          >
            <i className="bi bi-person icon-profile"></i>
            <span className="text-profile">Trang cá nhân</span>
          </a>
        </li>

        <li className="nav-item item-logout">
          <a className="nav-link collapsed link-logout" href="/">
            <i className="bi bi-box-arrow-right icon-logout"></i>
            <span className="text-logout">Đăng xuất</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;