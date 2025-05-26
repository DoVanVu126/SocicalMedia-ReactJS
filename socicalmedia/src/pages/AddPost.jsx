// src/pages/AddPost.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/AddPost.css'; // Import CSS thông thường
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AddPost = () => {
  // State để quản lý dữ liệu form (nội dung, ảnh, video, quyền riêng tư)
  const [form, setForm] = useState({
    content: '',
    images: [],
    video: null,
    visibility: 'public', // Mặc định là công khai
  });

  // State để lưu thông tin người dùng hiện tại
  const [user, setUser] = useState(null);
  // Hook để điều hướng giữa các trang
  const navigate = useNavigate();

  // State để lưu trữ các URL xem trước của ảnh đã chọn
  const [imagePreviews, setImagePreviews] = useState([]);
  // State để lưu trữ URL xem trước của video đã chọn
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

  // useEffect để tải thông tin người dùng từ localStorage khi component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // useEffect để tạo và giải phóng URL xem trước cho ảnh và video
  useEffect(() => {
    // Tạo URL xem trước cho ảnh khi form.images thay đổi
    if (form.images && form.images.length > 0) {
      const previews = form.images.map(image => URL.createObjectURL(image));
      setImagePreviews(previews);
    } else {
      setImagePreviews([]); // Reset nếu không có ảnh nào được chọn
    }

    // Tạo URL xem trước cho video khi form.video thay đổi
    if (form.video) {
      setVideoPreviewUrl(URL.createObjectURL(form.video));
    } else {
      setVideoPreviewUrl(null); // Reset nếu không có video nào được chọn
    }

    // Hàm cleanup: giải phóng các URL đối tượng để tránh rò rỉ bộ nhớ
    return () => {
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [form.images, form.video]); // Dependencies: chạy lại khi images hoặc video trong form thay đổi

  // Xử lý thay đổi input của form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) { // Nếu là input file (ảnh hoặc video)
      if (name === 'images') {
        setForm((prevForm) => ({ ...prevForm, images: Array.from(files) }));
      } else if (name === 'video') {
        setForm((prevForm) => ({ ...prevForm, [name]: files[0] }));
      }
    } else { // Nếu là input text hoặc select
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  // Xử lý gửi form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi gửi form mặc định
    if (!user) {
      alert('Vui lòng đăng nhập');
      return;
    }

    const data = new FormData(); // Tạo đối tượng FormData để gửi file và dữ liệu
    data.append('user_id', user.id);
    data.append('content', form.content);
    data.append('visibility', form.visibility);

    // Thêm từng ảnh vào FormData
    form.images.forEach((image) => {
      data.append(`images[]`, image); // Laravel expects an array
    });
    // Thêm video nếu có
    if (form.video) {
      data.append('video', form.video);
    }

    try {
      // Gửi yêu cầu POST đến API
      await axios.post('http://localhost:8000/api/posts', data, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Đặt header cho FormData
      });
      alert('Đăng bài thành công');
      navigate('/home'); // Điều hướng về trang chủ sau khi đăng bài
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert('Có lỗi xảy ra khi thêm bài viết');
    }
  };

  // Hiển thị thông báo tải nếu thông tin người dùng chưa có
  if (!user) {
    return <p>Đang tải thông tin người dùng…</p>;
  }

  // Xác định URL avatar của người dùng
  const avatarUrl = user.profilepicture
    ? `http://localhost:8000/storage/images/${user.profilepicture}`
    : '/default-avatar.png';

  return (
    <>
      <Header />
      <Sidebar />
      <div className="add-post-container">
        {/* Phần chính chứa thông tin người dùng và form */}
        <div className="add-post-main-content">
          <div className="add-post-user-info">
            <img src={avatarUrl} alt="Avatar" className="add-post-user-avatar" />
            <span className="add-post-user-name">{user.username}</span>
          </div>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="add-post-form">
            <textarea
              name="content"
              placeholder="Nội dung bài viết"
              value={form.content}
              onChange={handleChange}
              className="add-post-textarea"
            />
            {/* Selector quyền riêng tư */}
            <div className="add-post-visibility-selector">
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

            {/* Input chọn ảnh và video */}
            <div className="add-post-file-inputs">
              <label htmlFor="images" className="add-post-file-label">
                {form.images.length > 0 ? `${form.images.length} ảnh đã chọn` : 'Chọn ảnh'}
              </label>
              <input
                type="file"
                name="images"
                id="images"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="add-post-file-input"
              />

              <label htmlFor="video" className="add-post-file-label">
                {form.video ? form.video.name : 'Chọn video'}
              </label>
              <input
                type="file"
                name="video"
                id="video"
                accept="video/*"
                onChange={handleChange}
                className="add-post-file-input"
              />
            </div>
            <button type="submit" className="add-post-submit-button">Đăng bài</button>
          </form>
        </div>

        {/* Phần xem trước ảnh và video (hiển thị phía dưới) */}
        {(imagePreviews.length > 0 || videoPreviewUrl) && (
          <div className="add-post-preview-section">
            <h2>Xem trước</h2>
            {/* Danh sách ảnh xem trước */}
            {imagePreviews.length > 0 && (
              <div className="add-post-image-preview-list">
                {imagePreviews.map((previewUrl, index) => (
                  <img
                    key={index}
                    src={previewUrl}
                    alt={`Xem trước ${index}`}
                    className="add-post-image-preview-item"
                  />
                ))}
              </div>
            )}
            {/* Video xem trước */}
            {videoPreviewUrl && (
              <div className="add-post-video-preview-wrapper">
                <video src={videoPreviewUrl} controls className="add-post-video-preview" />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AddPost;
