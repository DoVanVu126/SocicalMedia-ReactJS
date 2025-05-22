import React, {useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {useNavigate} from "react-router-dom";

function Sidebar() {
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
        return null;
    }

    return (
        <aside id="sidebar" className="sidebar">
            <ul className="sidebar-nav" id="sidebar-nav">
                <li className="nav-item">
                    <a className="nav-link collapsed" href="/home">
                        <i className="bi bi-grid"></i>
                        <span>Thống kê</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a className="nav-link collapsed" href="/search">
                        <i className="bi bi-search"></i>
                        <span>Tìm kiếm</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a className="nav-link collapsed" href="/add-post">
                        <i className="bi bi-newspaper"></i>
                        <span>Thêm bài viết</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a className="nav-link collapsed" href="/story">
                        <i className="bi bi-camera"></i>
                        <span>Story</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a className="nav-link collapsed" href="#">
                        <i className="bi bi-heart"></i>
                        <span>Yêu thích</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a className="nav-link collapsed" href={`/notifications/${user.id}`}>
                        <i className="bi bi-bell"></i>
                        <span>Thông báo</span>
                    </a>
                </li>
                <li className="nav-item">
                    <a className="nav-link collapsed" data-bs-target="#users-nav" data-bs-toggle="collapse"
                       href="#">
                        <i className="bi bi-people"></i><span>Quản lí tài khoản</span><i
                        className="bi bi-chevron-down ms-auto"></i>
                    </a>
                    <ul id="users-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
                        <li>
                            <a href="/admin/users/list">
                                <i className="bi bi-circle"></i><span>Danh sách tài khoản</span>
                            </a>
                        </li>
                        <li>
                            <a href="/admin/users/create">
                                <i className="bi bi-circle"></i><span>Thêm mới tài khoản</span>
                            </a>
                        </li>
                    </ul>
                </li>

                <li className="nav-heading">Trang</li>

                <li className="nav-item">
                    <a className="nav-link collapsed" href="#">
                        <i className="bi bi-gear"></i>
                        <span>Cài đặt</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a className="nav-link collapsed" href="#">
                        <i className="bi bi-person"></i>
                        <span>Trang cá nhân</span>
                    </a>
                </li>

                <li className="nav-item">
                    <a className="nav-link collapsed" href="#">
                        <i className="bi bi-box-arrow-right"></i>
                        <span>Đăng xuất</span>
                    </a>
                </li>
            </ul>
        </aside>
    )
}

export default Sidebar;
