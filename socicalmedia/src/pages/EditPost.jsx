import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../style/EditPost.css';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [postOwnerId, setPostOwnerId] = useState(null);
  const [form, setForm] = useState({ content: '', video: null });
  const [images, setImages] = useState([]);
  const [oldImages, setOldImages] = useState([]); // Thêm state để lưu ảnh cũ
  const [previewVideo, setPreviewVideo] = useState('');
  const [removeVideo, setRemoveVideo] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));

    axios.get(`http://localhost:8000/api/posts/${id}`).then(res => {
      setForm(f => ({ ...f, content: res.data.content }));
      setPostOwnerId(res.data.user_id);

      if (res.data.imageurl) {
        const imgs = res.data.imageurl.split(','); // tách chuỗi thành mảng
        setOldImages(imgs);  // Lưu ảnh cũ vào state
      }

      if (res.data.videourl) {
        setPreviewVideo(`http://localhost:8000/storage/videos/${res.data.videourl}`);
      }
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.length) {
      if (name === 'image') {
        const newImgs = Array.from(files).map(file => ({
          file,
          src: URL.createObjectURL(file),
        }));
        setImages(prev => [...prev, ...newImgs]);
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

    axios.post(`http://localhost:8000/api/posts/${id}/remove-image`, { image: imgToRemove })
      .then(() => {
        setOldImages(prev => prev.filter((_, i) => i !== index));  // Xóa ảnh khỏi state
      })
      .catch(err => {
        console.error('Có lỗi khi xóa ảnh:', err);
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

  if (!user) return <p>Đang tải thông tin người dùng…</p>;
  if (user.id !== postOwnerId) return <p style={{ color: 'red' }}>❌ Bạn không có quyền chỉnh sửa bài viết này.</p>;

  const avatar = user.profilepicture
    ? `http://localhost:8000/storage/images/${user.profilepicture}`
    : '/default-avatar.png';

  return (
    <div className="add-post-container">
      <div className="user-info">
        <img src={avatar} alt="Avatar" className="user-avatar" />
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

        <div className="file-section">
          {oldImages.length > 0 ? oldImages.map((img, i) => (
            <div key={`old-${i}`} style={{ marginTop: 10 }}>
              <img
                src={`http://localhost:8000/storage/images/${img}`}
                alt={`old-${i}`}
                style={{ maxHeight: 200, borderRadius: 8 }}
              />
              <button type="button" onClick={() => handleRemoveOldImage(i)} style={{ color: 'red' }}>
                X
              </button>
            </div>
          )) : null}
        </div>

        <div className="file-section">
          {images.length > 0 ? images.map((img, i) => (
            <div key={i} style={{ marginTop: 10 }}>
              <img
                src={img.src}
                alt=""
                style={{ maxHeight: 200, borderRadius: 8 }}
              />
              <button type="button" onClick={() => handleRemoveImage(i)} style={{ color: 'red' }}>
                X
              </button>
            </div>
          )) : <p>Thêm ảnh mới</p>}
        </div>

        <label htmlFor="image" className="file-label">Chọn ảnh</label>
        <input type="file" id="image" name="image" accept="image/*" onChange={handleChange} className="file-input" />

        <div className="file-section">
          {previewVideo && (
            <div style={{ marginTop: 10 }}>
              <video controls style={{ maxHeight: 240, borderRadius: 8 }}>
                <source src={previewVideo} type="video/mp4" />
              </video>
              <button type="button" onClick={handleRemoveVideo} style={{ color: 'red' }}>
                X
              </button>
            </div>
          )}

        </div>
        <label htmlFor="video" className="file-label">Chọn video</label>
        <input type="file" id="video" name="video" accept="video/*" onChange={handleChange} className="file-input" />

        <button type="submit">💾 Lưu thay đổi</button>
      </form>
    </div>
  );
};

export default EditPost;
