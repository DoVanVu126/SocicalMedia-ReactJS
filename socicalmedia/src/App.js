// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

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
import DinoGame from "./pages/DinoGame";
import MiniGame from "./pages/MiniGame";
import MemoryGame from "./pages/MemoryGame";
import TicTacToe from "./pages/TicTacToe";
import ClickSpeedTest from "./pages/ClickSpeedTest";


import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import EditPost from "./pages/EditPost";
import ListUser from "./pages/users/ListUser";
import DetailUser from "./pages/users/DetailUser";
import CreateUser from "./pages/users/CreateUser";
import axios from 'axios';
import EditStory from "./pages/EditStory";
import FriendRequest from "./pages/friends/Index";
import Favourites from "./pages/favourites/Index";
import SavePost from "./pages/saves/Index";

// Set base URL and credentials
axios.defaults.baseURL = 'http://localhost:8000/api';
axios.defaults.withCredentials = true;


await axios.get('http://localhost:8000/sanctum/csrf-cookie');

axios.defaults.baseURL = 'http://localhost:8000/api';
axios.defaults.withCredentials = true;

await axios.get('http://localhost:8000/sanctum/csrf-cookie');


function AppLayout() {
    const location = useLocation();
    // Những path không muốn hiển thị sidebar
    const hideSidebar = ["/", "/register"].includes(location.pathname);

    return (
        <Routes>

            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />


            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/story" element={<Story />} /> {/* Đường dẫn cho Story */}
            <Route path="/storyviewer" element={<StoryViewer />} />
            <Route path="/search" element={<Search />} />
            <Route path="/home" element={<Home />} />

            <Route path="/users/:userId/followers" element={<FollowersList type="followers" />} />
            <Route path="/users/:userId/following" element={<FollowersList type="following" />} />
            <Route path="/users/:userId" element={<UserProfile />} />


            <Route path="/add-post" element={<AddPost />} />
            <Route path="/edit-post/:id" element={<EditPost />} />
            <Route path="/notifications/:userId" element={<Notification />} />
            <Route path="/edit-story/:id" element={<EditStory />} />

            {/* Admin user */}
            <Route path="/admin/users/list" element={<ListUser />} />
            <Route path="/admin/users/create" element={<CreateUser />} />
            <Route path="/admin/users/detail/:id" element={<DetailUser />} />

            <Route path="/friends" element={<FriendRequest />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/saves-post" element={<SavePost />} />
            {/* End admin user */}
            <Route path="/dinogame" element={<DinoGame />} />
            <Route path="/minigame" element={<MiniGame />} />
            <Route path="/memorygame" element={<MemoryGame />} />
            <Route path="/tictactoe" element={<TicTacToe />} />
            <Route path="/clickspeedtest" element={<ClickSpeedTest />} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}
