import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/AddPost.css';

const AddPost = () => {
  const [form, setForm] = useState({ content: '', images: [], video: null });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
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
    form.images.forEach((image, index) => {
      data.append(`images[]`, image); // Laravel expects an array
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
    ? `http://localhost:8000/storage/images/${user.profilepicture}`//Lấy trong thư mục public\storage\images
    : '/default-avatar.png';

  return (
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
          required
        />
        <div className="file-inputs">
          <label htmlFor="images" className="file-label">
            {form.images.length > 0 ? `${form.images.length} ảnh đã chọn` : 'Chọn nhiều ảnh'}
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
  );
};

export default AddPost;
