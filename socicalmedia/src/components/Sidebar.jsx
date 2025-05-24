import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";

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
                    <a className="nav-link collapsed link-notifications" href={`/notifications/${user.id}`}>
                        <i className="bi bi-bell icon-notifications"></i>
                        <span className="text-notifications">Thông báo</span>
                    </a>
                </li>

                <li className="nav-item item-manage-accounts">
                    <a className="nav-link collapsed link-manage-accounts" data-bs-target="#users-nav" data-bs-toggle="collapse" href="#">
                        <i className="bi bi-people icon-manage-accounts"></i>
                        <span className="text-manage-accounts">Quản lí tài khoản</span>
                        <i className="bi bi-chevron-down ms-auto icon-chevron-down-accounts"></i>
                    </a>
                    <ul id="users-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
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
                    <a className="nav-link collapsed link-profile" href={`/users/${user.id}`}>
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
    )
}

export default Sidebar;
