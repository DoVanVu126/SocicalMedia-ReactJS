import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [otpForm, setOtpForm] = useState({ otp_code: '' });
  const [message, setMessage] = useState('');
  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Xử lý thay đổi input
  const handleChange = (e) => {
    if (e.target.name === 'otp_code') {
      setOtpForm({ ...otpForm, otp_code: e.target.value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // BƯỚC 1: Gửi email + password
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/login', form);

      if (res.data.requires_otp && res.data.user_id) {
        setMessage(res.data.message);
        setIsOtpRequired(true);
        setUserId(res.data.user_id);
        localStorage.setItem('user_id', res.data.user_id);
      } else {
        setMessage('Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  // BƯỚC 2: Gửi mã OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/verify-otp', {
        user_id: userId,
        otp_code: otpForm.otp_code,
      });

      if (res.data.message === 'Xác thực OTP thành công') {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setMessage(res.data.message);
        navigate('/home');
      }
    } catch (err) {
      console.error('OTP verification error:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Xác thực OTP thất bại');
    }
  };

  return (
    <div className="login">
      <div className="login-form-container">
        <form onSubmit={isOtpRequired ? handleOtpSubmit : handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
          <h2 className="login-title">Đăng nhập</h2>

          {!isOtpRequired ? (
            <>
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
            </>
          ) : (
            <>
              <input
                type="text"
                name="otp_code"
                className="input-field"
                placeholder="Nhập mã OTP"
                value={otpForm.otp_code}
                onChange={handleChange}
                required
              />
              <button type="submit" className="submit-btn">Xác thực OTP</button>
            </>
          )}

          {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}

          {!isOtpRequired && (
            <div className="signup-link">
              <p className="signup-text">
                Chưa có tài khoản? <a href="/register" className="signup-link-text">Đăng ký ngay</a>
              </p>
            </div>
          )}
        </form>
      </div>

      <div className="login-image-container">
        <img src="http://localhost:8000/storage/image/login-image.jpg" alt="Login illustration" className="login-image" />
      </div>
    </div>
  );
};

export default Login;
