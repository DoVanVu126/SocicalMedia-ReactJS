import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/Register.css';

const Register = () => {

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Ràng buộc các trường
    if (!form.username.trim()) {
      setMessage('Vui lòng nhập username.');
      return;
    }

    if (!form.email.trim()) {
      setMessage('Vui lòng nhập email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage('Email không hợp lệ.');
      return;
    }

    if (!form.password) {
      setMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    if (form.password.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (form.phone) {
      const phoneRegex = /^0[0-9]{8,10}$/;
      if (!phoneRegex.test(form.phone)) {
        setMessage('Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và gồm 9-11 chữ số).');
        return;
      }
    }


    try {
      const res = await axios.post('http://localhost:8000/api/register', form);
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      setMessage('Lỗi đăng ký: ' + (err.response?.data?.message || err.message));
    }
  };


  return (
    <div className="register">
      <div className="register-form-container">
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
          <h2 className="register-title">Đăng ký</h2>

          <input
            type="text"
            name="username"
            className="input-field"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

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
            type="text"
            name="phone"
            className="input-field"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
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

          <button type="submit" className="submit-btn" style={{ marginTop: '15px' }}>
            Đăng ký
          </button>

          {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}

          <div className="signup-link" style={{ marginTop: '12px' }}>
            <p className="signup-text">
              Đã có tài khoản? <a href="/login" className="signup-link-text">Đăng nhập ngay</a>
            </p>
          </div>
        </form>
      </div>

      <div className="register-image-container">
        {imageLoading && (
          <div className="image-loader">
            <div className="circle-loader"></div>
            <p className="text-loading">Đang tải ảnh...</p>
          </div>
        )}
        <img
          src="http://localhost:8000/storage/image/register-image.jpg"
          alt="Register illustration"
          className="register-image"
          onLoad={() => setImageLoading(false)}
          onError={(e) => {
            e.target.src = 'http://localhost:8000/storage/image/register-image4.png';
            setImageLoading(false);
          }}
          style={{ display: imageLoading ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
};

export default Register;
