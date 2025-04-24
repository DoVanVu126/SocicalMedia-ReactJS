// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/login', form);
      const userData = res.data.user;
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setMessage(res.data.message);
        navigate('/home');
      } else {
        throw new Error('Response không có user');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="login">
      {/* LEFT: Form */}
      <div className="login-form-container">
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
          <h2 className="login-title">Đăng nhập</h2>
          <input
            type="email"
            name="email"
            className="input-field"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            className="input-field"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="submit-btn">Đăng nhập</button>
          {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}

          <div className="signup-link">
            <p className="signup-text">
              Chưa có tài khoản? <a href="/register" className="signup-link-text">Đăng ký ngay</a>
            </p>
          </div>
        </form>
      </div>

      {/* RIGHT: Image */}
      <div className="login-image-container">
        <img src="http://localhost:8000/storage/image/login-image.jpg" alt="Login illustration" className="login-image" />
      </div>
    </div>
  );
};

export default Login;
