// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import Notification from './pages/Notification';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/home" element={<Home />} />
        {/* Thêm các route khác nếu cần */}
      </Routes>
    </Router>
  );
}

export default App;
