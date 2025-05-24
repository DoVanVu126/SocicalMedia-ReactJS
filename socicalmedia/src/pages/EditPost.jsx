import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../style/EditPost.css';
import { FaRocket } from 'react-icons/fa'; // Import icon tên lửa
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [postOwnerId, setPostOwnerId] = useState(null);
  const [form, setForm] = useState({ content: '', video: null });
  const [images, setImages] = useState([]);
  const [oldImages, setOldImages] = useState([]);
  const [previewVideo, setPreviewVideo] = useState('');
  const [removeVideo, setRemoveVideo] = useState(false);
  const [isLoadingOldImages, setIsLoadingOldImages] = useState(true);
  const [isLoadingNewImages, setIsLoadingNewImages] = useState(false); // Thêm state loading cho ảnh mới

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));

    axios.get(`http://localhost:8000/api/posts/${id}`).then(res => {
      setForm(f => ({ ...f, content: res.data.content }));
      setPostOwnerId(res.data.user_id);

      if (res.data.imageurl) {
        const imgs = res.data.imageurl.split(',');
        setOldImages(imgs);
      }

      if (res.data.videourl) {
        setPreviewVideo(`http://localhost:8000/storage/videos/${res.data.videourl}`);
      }
      setIsLoadingOldImages(false);
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.length) {
      if (name === 'image') {
        setIsLoadingNewImages(true); // Bắt đầu loading khi có ảnh mới
        const newImgs = Array.from(files).map(file => ({
          file,
          src: URL.createObjectURL(file),
        }));
        setImages(prev => [...prev, ...newImgs]);
        setIsLoadingNewImages(false); // Kết thúc loading sau khi ảnh mới được thêm
      }
      if (name === 'video') {
        setForm(f => ({ ...f, video: files[0] }));
        setPreviewVideo(URL.createObjectURL(files[0]));
        setRemoveVideo(false);
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleRemoveImage = (i) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleRemoveOldImage = (index) => {
    const imgToRemove = oldImages[index];
    setIsLoadingOldImages(true);
    axios.post(`http://localhost:8000/api/posts/${id}/remove-image`, { image: imgToRemove })
      .then(() => {
        setOldImages(prev => prev.filter((_, i) => i !== index));
        setIsLoadingOldImages(false);
      })
      .catch(err => {
        console.error('Có lỗi khi xóa ảnh:', err);
        setIsLoadingOldImages(false);
      });
  };

  const handleRemoveVideo = () => {
    setForm(f => ({ ...f, video: null }));
    setPreviewVideo('');
    setRemoveVideo(true);
    document.getElementById('video').value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Vui lòng đăng nhập');

    const data = new FormData();
    data.append('content', form.content);
    images.forEach(img => data.append('image[]', img.file));
    if (form.video) data.append('video', form.video);
    if (removeVideo) data.append('remove_video', '1');

    try {
      await axios.post(`http://localhost:8000/api/posts/${id}?_method=PUT`, data);
      alert('Cập nhật bài viết thành công');
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi cập nhật bài viết');
    }
  };

  if (!user) return <p>Vui lòng đăng nhập để chỉnh sửa bài viết.</p>;
  if (user.id !== postOwnerId) return <p style={{ color: 'red' }}>❌ Bạn không có quyền chỉnh sửa bài viết này.</p>;

  const avatar = user.profilepicture
    ? `http://localhost:8000/storage/images/${user.profilepicture}`
    : '/default-avatar.png';

  return (
    <><Header />
      <Sidebar />
      <div className="add-post-container-edit">
        <div className="user-info-edit">
          <img src={avatar} alt="Avatar" className="user-avatar-edit" />
          <span className="user-name-edit">{user.username}</span>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <textarea
            name="content"
            placeholder="Nội dung bài viết"
            value={form.content}
            onChange={handleChange}
            required
            className="textarea-edit"
          />

          <div className="file-section-edit horizontal-images">
            {isLoadingOldImages ? (
              <div className="loading-container-edit">
                <FaRocket className="rocket-icon-edit" size={40} color="#007bff" />
                <span className="loading-text-edit">Đang tải ảnh cũ...</span>
              </div>
            ) : (
              oldImages.length > 0 && oldImages.map((img, i) => (
                <div key={`old-${i}`} className="image-preview-container-edit">
                  <img
                    src={`http://localhost:8000/storage/images/${img}`}
                    alt={`old-${i}`}
                    className="image-preview-edit"
                  />
                  <button type="button" onClick={() => handleRemoveOldImage(i)} className="remove-image-button-edit">
                    X
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="file-section-edit horizontal-images">
            {isLoadingNewImages ? (
              <div className="loading-container-edit">
                <FaRocket className="rocket-icon-edit" size={40} color="#007bff" />
                <span className="loading-text-edit">Đang tải ảnh mới...</span>
              </div>
            ) : images.length > 0 ? (
              images.map((img, i) => (
                <div key={i} className="image-preview-container-edit">
                  <img
                    src={img.src}
                    alt=""
                    className="image-preview-edit"
                  />
                  <button type="button" onClick={() => handleRemoveImage(i)} className="remove-image-button-edit">
                    X
                  </button>
                </div>
              ))
            ) : (
              <p>Thêm ảnh mới</p>
            )}
          </div>

          <label htmlFor="image" className="file-label-edit">Chọn ảnh</label>
          <input type="file" id="image" name="image" accept="image/*" onChange={handleChange} className="file-input-edit" multiple />

          <div className="file-section-edit">
            {previewVideo && (
              <div style={{ marginTop: 10 }}>
                <video controls style={{ maxHeight: 240, borderRadius: 8 }}>
                  <source src={previewVideo} type="video/mp4" />
                </video>
                <button type="button" onClick={handleRemoveVideo} style={{ color: 'blue' }}>
                  X
                </button>
              </div>
            )}
          </div>
          <label htmlFor="video" className="file-label-edit">Chọn video</label>
          <input type="file" id="video" name="video" accept="video/*" onChange={handleChange} className="file-input-edit" />

          <button type="submit" className="button-edit">💾 Lưu thay đổi</button>
        </form>
      </div>
    </>
  );
};

export default EditPost;