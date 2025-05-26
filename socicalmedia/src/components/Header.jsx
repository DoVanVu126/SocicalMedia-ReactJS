import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {BASE_URL_SERVER} from "../config/server";
import {initBlinkText} from '../script';
import "../style/Home.css";

const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('Đăng xuất thành công!')
    window.location.href = `/`;
}

function Header() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
  setTimeout(() => {
    initBlinkText();
  }, 100); // chờ 100ms để DOM render xong
}, []);
    const handleUserClick = () => {
        navigate('/user');
    };

    if (!user) {
        return null;
    }

    const avatarUrl = user.profilepicture
        ? BASE_URL_SERVER + '/storage/images/' + user.profilepicture
        : '/default-avatar.png';
    return (
        <>
            <header id="header" className="header fixed-top d-flex align-items-center">

                <div className="d-flex align-items-center justify-content-between">
                    <a href="/home" className="logo d-flex align-items-center">
                        <img src="/logo192.png" alt=""/>
                        <span className="d-none d-lg-block blink-text">Socical App</span>
                    </a>
                    <i className="bi bi-list toggle-sidebar-btn"></i>
                </div>

                <nav className="header-nav ms-auto">
                    <ul className="d-flex align-items-center">

                        <li className="nav-item dropdown pe-3">
                            <a className="nav-link nav-profile d-flex align-items-center pe-0" href="#"
                               data-bs-toggle="dropdown">
                                <img src={avatarUrl} alt="Profile" className="rounded-circle"/>
                                <span className="d-none d-md-block dropdown-toggle ps-2">{user.username}</span>
                            </a>

                            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                                <li className="dropdown-header">
                                    <h6>{user.username}</h6>
                                </li>
                                <li>
                                    <hr className="dropdown-divider"/>
                                </li>

                                <li>
                                    <a className="dropdown-item d-flex align-items-center" href="#">
                                        <i className="bi bi-gear"></i>
                                        <span>Cài đặt</span>
                                    </a>
                                </li>
                                <li>
                                    <hr className="dropdown-divider"/>
                                </li>

                                <li>
                                    <a className="dropdown-item d-flex align-items-center" href={`/users/${user.id}`}>
                                        <i className="bi bi-person"></i>
                                        <span>Trang cá nhân</span>
                                    </a>
                                </li>
                                <li>
                                    <hr className="dropdown-divider"/>
                                </li>

                                <li>
                                    <a className="dropdown-item d-flex align-items-center"
                                       onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right"></i>
                                        <span>Đăng xuất</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default Header