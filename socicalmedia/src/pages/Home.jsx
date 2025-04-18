// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar'; // Đường dẫn đúng
import '../style/Home.css'; // Đảm bảo bạn đã tạo file này

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="hhh">
      <Sidebar />
      <div className="main">
        {Array.isArray(posts) && posts.map(post => (
          <div className="post" key={post.id}>
            <div className="post-header">
              <div className="user-info">
                <img
                  src={`http://localhost:8000/storage/image/${post.user?.profilepicture || 'default-avatar.png'}`}
                  alt="Avatar"
                  className="avatar"
                />
                <div>
                  <strong>{post.user?.username}</strong>
                  <br />
                  <small>{new Date(post.created_at).toLocaleString()}</small>
                </div>
              </div>
              <div className="post-options">
                <button className="options-btn">⋯</button>
                <div className="options-menu">
                  <button>📝 Sửa</button>
                  <button onClick={() => alert("Bạn có chắc chắn muốn xóa không?")}>🗑️ Xóa</button>
                </div>
              </div>
            </div>

            <p className="post-content">{post.content}</p>

            <div className="media-wrapper">
              {post.imageurl && (
                <img
                  src={`http://localhost:8000/storage/image/${post.imageurl}`}
                  alt="Ảnh"
                  className="post-image"
                />
              )}
              {post.videourl && (
                <video controls className="post-video">
                  <source src={`http://localhost:8000/storage/video/${post.videourl}`} type="video/mp4" />
                </video>
              )}
            </div>

            <div className="actions">
              <button>👍 Thích</button>
              <button>💬 Bình luận</button>
              <button>🔗 Chia sẻ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
