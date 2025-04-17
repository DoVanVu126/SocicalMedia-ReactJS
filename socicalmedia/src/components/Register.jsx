// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    profilepicture: '',
    two_factor_enabled: false
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/register', form);
      setMessage(res.data.message);
      alert('Đăng ký thành công!');
      navigate('/login'); // Chuyển hướng sang màn hình đăng nhập
    } catch (err) {
      setMessage('Lỗi đăng ký: ' + (err.response?.data?.message || ''));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Username" onChange={e => setForm({ ...form, username: e.target.value })} />
      <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <input placeholder="Phone" onChange={e => setForm({ ...form, phone: e.target.value })} />
      <input placeholder="Profile Picture URL" onChange={e => setForm({ ...form, profilepicture: e.target.value })} />
      <button type="submit">Đăng ký</button>
      <p>{message}</p>
    </form>
  );
};

export default Register;
