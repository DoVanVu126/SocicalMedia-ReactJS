// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import AddPost from './pages/AddPost';
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';

import Story from './pages/Story';  
import Search from './pages/Search'; 
import UserProfile from './pages/UserProfile';



import EditPost from "./pages/EditPost";

function AppLayout() {
  const location = useLocation();
  // Những path không muốn hiển thị sidebar
  const hideSidebar = ['/', '/register'].includes(location.pathname);



  return (

    <div style={{ display: 'flex' }}>
      {!hideSidebar && <Sidebar />}

      <div
        style={{
          marginLeft: hideSidebar ? 0 : '250px',
          padding: '20px',
          width: '100%',
        }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="/home"
            element={<Home />}
            
          />
      
<Route path="/profile/:userId" element={<UserProfile />} />
<Route path="/story" element={<Story />} /> {/* Đường dẫn cho Story */}
<Route path="/search" element={<Search />} />
          
          <Route
            path="/add-post"  
            element={<AddPost />}
          />
          <Route path="/edit-post/:id" element={<EditPost />} />
           <Route path="/notifications/:userId" element={<Notification />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
