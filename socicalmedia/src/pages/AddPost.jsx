import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/AddPost.css';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AddPost = () => {
  const [form, setForm] = useState({
    content: '',
    images: [],
    video: null,
    visibility: 'public', // mặc định là công khai
  });

  const [user, setUser] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Hide intro after 1.8 seconds (0.8s animation + 1s display)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1800); // 800ms for animation + 1000ms display
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (name === 'images') {
        setForm((f) => ({ ...f, images: Array.from(files) }));
      } else {
        setForm((f) => ({ ...f, [name]: files[0] }));
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Vui lòng đăng nhập');

    const data = new FormData();
    data.append('user_id', user.id);
    data.append('content', form.content);
    data.append('visibility', form.visibility);

    form.images.forEach((image, index) => {
      data.append(`images[]`, image);
    });
    if (form.video) data.append('video', form.video);

    try {
      await axios.post('http://localhost:8000/api/posts', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Đăng bài thành công');
      navigate('/home');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Có lỗi xảy ra khi thêm bài viết');
    }
  };

  if (!user) return <p>Đang tải thông tin người dùng…</p>;

  const avatarUrl = user.profilepicture
    ? `http://localhost:8000/storage/images/${user.profilepicture}`
    : '/default-avatar.png';

  // Split "Add Post" into individual letters for animation
  const title = "Add Post";
  const letters = title.split('');

  if (showIntro) {
    return (
      <div className="add-post-intro-container">
        <div className="add-post-intro-text">
          {letters.map((letter, index) => (
            <span
              key={index}
              className="add-post-intro-letter"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Sidebar />
      <div className="add-post-container">
        <div className="user-info">
          <img src={avatarUrl} alt="Avatar" className="user-avatar" />
          <span className="user-name">{user.username}</span>
        </div>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <textarea
            name="content"
            placeholder="Nội dung bài viết"
            value={form.content}
            onChange={handleChange}
          />
          <div className="visibility-selector">
            <label htmlFor="visibility">Quyền riêng tư:</label>
            <select
              id="visibility"
              name="visibility"
              value={form.visibility}
              onChange={handleChange}
            >
              <option value="public">Công khai</option>
              <option value="private">Riêng tư</option>
            </select>
          </div>
          <div className="file-inputs">
            <label htmlFor="images" className="file-label">
              {form.images.length > 0 ? `${form.images.length} ảnh đã chọn` : 'Chọn ảnh'}
            </label>
            <input
              type="file"
              name="images"
              id="images"
              accept="image/*"
              multiple
              onChange={handleChange}
              className="file-input"
            />
            <label htmlFor="video" className="file-label">
              {form.video ? form.video.name : 'Chọn video'}
            </label>
            <input
              type="file"
              name="video"
              id="video"
              accept="video/*"
              onChange={handleChange}
              className="file-input"
            />
          </div>
          <button type="submit">Đăng bài</button>
        </form>
      </div>
    </>
  );
};

export default AddPost;