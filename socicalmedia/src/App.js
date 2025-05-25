// src/App.js

import {BrowserRouter as Router, Routes, Route, Navigate, useLocation} from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import AddPost from './pages/AddPost';
import Notification from './components/Notification';
import StoryViewer from './components/StoryViewer';

import Story from "./pages/Story";
import Search from "./pages/Search";
import FollowersList from "./pages/FollowersList";
import UserProfile from "./pages/UserProfile";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import EditPost from "./pages/EditPost";
import ListUser from "./pages/users/ListUser";
import DetailUser from "./pages/users/DetailUser";
import CreateUser from "./pages/users/CreateUser";

import FriendRequest from "./pages/friends/Index";
import EditStory from "./pages/EditStory";

import axios from 'axios';
import EditStory from "./pages/EditStory";



// Set base URL and credentials
axios.defaults.baseURL = 'http://localhost:8000/api';
axios.defaults.withCredentials = true;

// Fetch CSRF cookie on app load
axios.get('/sanctum/csrf-cookie')
  .then(() => console.log('CSRF cookie fetched'))
  .catch(error => console.error('Error fetching CSRF cookie:', error));

function AppLayout() {
  const location = useLocation();
  // Những path không muốn hiển thị sidebar
  const hideSidebar = ["/", "/register"].includes(location.pathname);

    return (
        <Routes>

            <Route path="/" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            

            <Route path="/profile/:userId" element={<UserProfile/>}/>
            <Route path="/story" element={<Story/>}/> {/* Đường dẫn cho Story */}
            <Route path="/storyviewer" element={<StoryViewer />} />
            <Route path="/search" element={<Search/>}/>
            <Route path="/home" element={<Home/>}/>

            <Route path="/users/:userId/followers" element={<FollowersList type="followers" />} />
<Route path="/users/:userId/following" element={<FollowersList type="following" />} />
<Route path="/users/:userId" element={<UserProfile />} />

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
