import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/AddPost.css';

const AddPost = () => {
  const [form, setForm] = useState({ content: '', image: null, video: null });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Vui lòng đăng nhập');

    const data = new FormData();
    data.append('content', form.content);
    data.append('user_id', user.id);
    data.append('status', 'active');
    if (form.image) data.append('image', form.image);
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

  return (
    <div className="add-post-container">
      <div className="user-info">
        <img src={avatarUrl} alt="Avatar" className="user-avatar" />
        <span className="user-name">{user.username}</span>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          name="content"
          placeholder="Nội dung bài viết"
          value={form.content}
          onChange={handleChange}
          required
        />
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        <input type="file" name="video" accept="video/*" onChange={handleChange} />
        <button type="submit">Đăng bài</button>
      </form>
    </div>
  );
};

export default AddPost;
