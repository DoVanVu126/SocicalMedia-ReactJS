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
    profilepicture: null
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilepicture') {
      setForm({ ...form, profilepicture: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('email', form.email);
    formData.append('password', form.password);
    formData.append('phone', form.phone);
    if (form.profilepicture) {
      formData.append('profilepicture', form.profilepicture);
    }

    try {
      const res = await axios.post('http://localhost:8000/api/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      setMessage('Lỗi đăng ký: ' + (err.response?.data?.message || ''));
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input name="username" placeholder="Username" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <input name="profilepicture" type="file" accept="image/*" onChange={handleChange} />
      <button type="submit">Đăng ký</button>
      <p>{message}</p>
    </form>
  );
};

export default Register;
