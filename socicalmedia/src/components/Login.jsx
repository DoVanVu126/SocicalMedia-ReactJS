import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/login', form);
      console.log(res.data.user);  // Kiểm tra response từ server

      // Lưu thông tin người dùng vào localStorage
      const userData = res.data.user;
      localStorage.setItem('user', JSON.stringify(userData));

      alert('Đăng nhập thành công!');
      navigate('/home');
    } catch (err) {
      alert('Lỗi đăng nhập! Kiểm tra lại email và mật khẩu.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="login-title">Đăng nhập</h2>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="input-field"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            className="input-field"
            required
          />
          <button
            type="submit"
            className="submit-btn"
          >
            Đăng nhập
          </button>
          <div className="signup-link">
            <span className="signup-text">Chưa có tài khoản?</span>
            <a href="/register" className="signup-link-text"> Đăng ký ngay</a>
          </div>
        </form>
      </div>

      <div className="login-image-container">
        <img src="https://via.placeholder.com/500x500" alt="Login illustration" className="login-image" />
      </div>
    </div>
  );
};

export default Login;
