// src/pages/AddPost.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/AddPost.css'; // Import CSS thông thường
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const AddPost = () => {
  const [form, setForm] = useState({
    content: '',
    images: [],
    video: null,
    visibility: 'public',
  });
  const [user, setUser] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [removingImageIndex, setRemovingImageIndex] = useState(null);
  const [isRemovingVideo, setIsRemovingVideo] = useState(false);

  const handleRemoveImage = (indexToRemove) => {
    setImagePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    setRemovingImageIndex(null);
  };

  const startRemoveImageAnimation = (indexToRemove) => {
    setRemovingImageIndex(indexToRemove);
    setTimeout(() => {
      handleRemoveImage(indexToRemove);
    }, 500); // Thời gian animation (0.5s)
  };

  const handleRemoveVideo = () => {
    setVideoPreviewUrl(null);
    setIsRemovingVideo(false);
  };

  const startRemoveVideoAnimation = () => {
    setIsRemovingVideo(true);
    setTimeout(() => {
      handleRemoveVideo();
    }, 500); // Thời gian animation (0.5s)
  };
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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
  // Hide intro after 1.8 seconds (0.8s animation + 1s display)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1800); // 800ms for animation + 1000ms display
    return () => clearTimeout(timer);
  }, []);

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
                  <div key={index} className="add-post-preview-item-wrapper">
                    <img
                      src={previewUrl}
                      alt={`Xem trước ${index}`}
                      className={`add-post-image-preview-item ${removingImageIndex === index ? 'removing' : ''
                        }`}
                    />
                    <button
                      className="remove-preview-button"
                      onClick={() => startRemoveImageAnimation(index)}
                      disabled={removingImageIndex !== null} // Vô hiệu hóa nút khi đang xóa
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Video xem trước */}
            {videoPreviewUrl && (
              <div className="add-post-video-preview-wrapper">
                <video
                  src={videoPreviewUrl}
                  controls
                  className={`add-post-video-preview ${isRemovingVideo ? 'removing' : ''}`}
                />
                <button
                  className="remove-preview-button"
                  onClick={startRemoveVideoAnimation}
                  disabled={isRemovingVideo} // Vô hiệu hóa nút khi đang xóa
                >
                  X
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
};

export default AddPost;