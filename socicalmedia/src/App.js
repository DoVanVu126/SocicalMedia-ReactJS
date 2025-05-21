// src/App.js
import {BrowserRouter as Router, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import AddPost from './pages/AddPost';
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';

import Story from './pages/Story';
import Search from './pages/Search';
import UserProfile from './pages/UserProfile';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import EditPost from "./pages/EditPost";
import ListUser from "./pages/users/ListUser";
import DetailUser from "./pages/users/DetailUser";
import CreateUser from "./pages/users/CreateUser";

function AppLayout() {
    const location = useLocation();
    // Những path không muốn hiển thị sidebar
    const hideSidebar = ['/', '/register'].includes(location.pathname);

    return (
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route path="/home" element={<Home/>}/>

            <Route path="/profile/:userId" element={<UserProfile/>}/>
            <Route path="/story" element={<Story/>}/> {/* Đường dẫn cho Story */}
            <Route path="/search" element={<Search/>}/>

            <Route path="/add-post" element={<AddPost/>}/>
            <Route path="/edit-post/:id" element={<EditPost/>}/>
            <Route path="/notifications/:userId" element={<Notification/>}/>
            {/* Admin user */}
            <Route path="/admin/users/list" element={<ListUser/>}/>
            <Route path="/admin/users/create" element={<CreateUser/>}/>
            <Route path="/admin/users/detail/:id" element={<DetailUser/>}/>
            {/* End admin user */}
            <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
    );
}

export default function App() {
    return (
        <Router>
            <AppLayout/>
        </Router>
    );
}
