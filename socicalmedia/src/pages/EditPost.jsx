import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../style/EditPost.css';
import { FaRocket } from 'react-icons/fa';
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
  const [isLoadingNewImages, setIsLoadingNewImages] = useState(false);
  const [originalUpdatedAt, setOriginalUpdatedAt] = useState(null);
  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};
    if (!form.content.trim() && images.length === 0 && !form.video) {
      newErrors.content = 'Vui lòng nhập nội dung hoặc chọn ảnh/video.';
    }
    if (form.content && form.content.length > 500) {
      newErrors.content = 'Nội dung không được vượt quá 500 ký tự.';
    }
    if (images.length > 10) {
      newErrors.images = 'Chỉ được chọn tối đa 10 ảnh.';
    }
    if (form.video && form.video.size > 20 * 1024 * 1024) { // 20MB
      newErrors.video = 'Video vượt quá dung lượng tối đa cho phép (20MB).';
    }
    return newErrors;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));

        const res = await axios.get(`http://localhost:8000/api/posts/${id}`);
        const post = res.data;
        setForm({ content: post.content, video: null });
        setPostOwnerId(post.user_id);

        setOldImages(post.imageurl?.split(',') || []);
        setPreviewVideo(post.videourl ? `http://localhost:8000/storage/videos/${post.videourl}` : '');
        setOriginalUpdatedAt(post.updated_at);
      } catch (err) {
        console.error('Lỗi khi tải bài viết:', err);
        alert('Không tìm thấy bài viết hoặc có lỗi khi tải.');
      } finally {
        setIsLoadingOldImages(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files?.length) {
      if (name === 'image') {
        setIsLoadingNewImages(true);
        setOldImages([]);
        setImages([]);
        const newImgs = Array.from(files).map(file => ({
          file,
          src: URL.createObjectURL(file),
        }));
        setImages(newImgs);
        setIsLoadingNewImages(false);
      } else if (name === 'video') {
        const file = files[0];
        setForm(f => ({ ...f, video: file }));
        setPreviewVideo(URL.createObjectURL(file));
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
      })
      .catch(err => {
        console.error('Có lỗi khi xóa ảnh:', err);
      })
      .finally(() => setIsLoadingOldImages(false));
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

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // Bạn có thể hiển thị lỗi theo ý muốn, ví dụ alert hoặc setState để hiện UI
      alert(Object.values(errors).join('\n'));
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8000/api/posts/${id}`);
      const latestUpdatedAt = res.data.updated_at;

      if (originalUpdatedAt && originalUpdatedAt !== latestUpdatedAt) {
        alert('Bài viết đã được cập nhật bởi phiên bản khác. Vui lòng tải lại trang để chỉnh sửa.');
        return;
      }

      const data = new FormData();
      data.append('content', form.content);
      if (images.length > 0) {
        images.forEach(img => data.append('image[]', img.file));
      }
      if (form.video) data.append('video', form.video);
      if (removeVideo) data.append('remove_video', '1');

      await axios.post(`http://localhost:8000/api/posts/${id}?_method=PUT`, data);
      alert('Cập nhật bài viết thành công');
      navigate('/home');
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi cập nhật bài viết');
    }
  };

  if (!user) return <p>Vui lòng đăng nhập để chỉnh sửa bài viết.</p>;
  if (user.id !== postOwnerId) return <p style={{ color: 'red' }}>TRANG NÀY KHÔNG TỒN TẠI !!!!!!!!  TRANG NÀY KHÔNG TỒN TẠI !!!!!!!!   TRANG NÀY KHÔNG TỒN TẠI !!!!!!!!   TRANG NÀY KHÔNG TỒN TẠI !!!!!!!!   TRANG NÀY KHÔNG TỒN TẠI !!!!!!!!   TRANG NÀY KHÔNG TỒN TẠI !!!!!!!!   TRANG NÀY KHÔNG TỒN TẠI !!!!!!!!   TRANG NÀY KHÔNG TỒN TẠI !!!!!!!!   </p>;

  const avatar = user.profilepicture
    ? `http://localhost:8000/storage/images/${user.profilepicture}`
    : '/default-avatar.png';

  return (
    <>
      <Header />
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
          {errors.content && <p className="error-text">{errors.content}</p>}

          {/* Ảnh cũ */}
          {isLoadingOldImages ? (
            <div className="loading-container-edit">
              <FaRocket className="rocket-icon-edit" size={40} color="#007bff" />
              <span className="loading-text-edit">Đang tải ảnh cũ...</span>
            </div>
          ) : oldImages.length > 0 ? (
            <div className="file-section-edit horizontal-images">
              {oldImages.map((img, i) => (
                <div key={`old-${i}`} className="image-preview-container-edit">
                  <img
                    src={`http://localhost:8000/storage/images/${img}`}
                    alt={`old-${i}`}
                    className="image-preview-edit"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>Không có ảnh cũ nào.</p>
          )}
          {/* Ảnh mới */}
          <div className="file-section-edit horizontal-images">
            {images.length > 0 && images.some(img => img?.src) ? (
              images.map((img, i) => (
                img?.src ? (
                  <div key={i} className="image-preview-container-edit">
                    <img src={img.src} alt="" className="image-preview-edit" />
                    <button type="button" onClick={() => handleRemoveImage(i)} className="remove-image-button-edit">X</button>
                  </div>
                ) : null
              ))
            ) : (
              <p>Thêm ảnh mới</p>
            )}
          </div>

          <label htmlFor="image" className="file-label-edit">Chọn ảnh</label>
          <input type="file" id="image" name="image" accept="image/*" onChange={handleChange} className="file-input-edit" multiple />
          {errors.images && <p className="error-text">{errors.images}</p>}

          {/* Video */}
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
          {errors.video && <p className="error-text">{errors.video}</p>}
          <button type="submit" className="button-edit">💾 Lưu thay đổi</button>
        </form>
      </div>
    </>
  );
};

export default EditPost;
