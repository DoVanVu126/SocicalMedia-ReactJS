import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../style/UserProfile.css";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [bio, setBio] = useState("Chưa có tiểu sử");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Lấy ID người dùng hiện tại từ localStorage
  useEffect(() => {
    const savedUserId = localStorage.getItem('user_id');
    if (savedUserId) {
      const id = parseInt(savedUserId, 10);
      if (!isNaN(id)) setCurrentUserId(id);
      else setError("ID người dùng không hợp lệ.");
    } else {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
    }
  }, []);

  // Lấy thông tin người dùng và bài viết
  const fetchUserData = () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/api/users/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy người dùng');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setPosts(data.posts || []);
        setFollowCount(data.followers_count || 0);
        setFollowingCount(data.following_count || 0);
        setBio(data.bio || "Chưa có tiểu sử");
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Kiểm tra trạng thái follow
  useEffect(() => {
    if (!user || !currentUserId || user.id === currentUserId) return;

    axios.post('http://localhost:8000/api/follow-status', {
      follower_id: currentUserId,
      followed_id: user.id,
    })
    .then(res => {
      setIsFollowing(res.data.isFollowing || false);
    })
    .catch(() => setIsFollowing(false));
  }, [user, currentUserId]);

  // Theo dõi hoặc hủy theo dõi
  const toggleFollow = () => {
    if (processing || !currentUserId) return;
    setProcessing(true);

    const url = isFollowing
      ? 'http://localhost:8000/api/unfollow'
      : 'http://localhost:8000/api/follow';

    axios.post(url, {
      follower_id: currentUserId,
      followed_id: user.id,
    })
    .then(() => {
      setIsFollowing(!isFollowing);
      setFollowCount(prev => isFollowing ? prev - 1 : prev + 1);
    })
    .catch(err => {
      alert(err.response?.data?.message || 'Lỗi khi thao tác follow');
    })
    .finally(() => setProcessing(false));
  };

  // Chỉnh sửa tiểu sử
  const handleBioEdit = () => setIsEditingBio(true);

  const handleBioSave = () => {
    if (!user) return;
    setProcessing(true);
    axios.put(`http://localhost:8000/api/users/${user.id}/bio`, { bio })
      .then(() => {
        setUser(prev => ({ ...prev, bio }));
        setIsEditingBio(false);
      })
      .catch(() => {
        alert('Lỗi khi lưu tiểu sử');
      })
      .finally(() => setProcessing(false));
  };

  const handleBioChange = (e) => setBio(e.target.value);

  const refreshPosts = () => {
    fetchUserData();
  };

  if (loading) return <p className="loading-text">Đang tải thông tin người dùng...</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="app-container">
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="profile-container">
          <div className="top-buttons">
            <button onClick={() => navigate(-1)} className="back-button">← Quay lại</button>
            <button onClick={refreshPosts} className="refresh-button">🔄 Làm mới</button>
          </div>

          <div className="profile-card">
            <div className="avatar-wrapper">
              <img
                src={user.profilepicture
                  ? `http://localhost:8000/storage/images/${user.profilepicture}`
                  : '/default-avatar.png'}
                alt={`${user.username} avatar`}
                className="avatar"
                onError={e => e.currentTarget.src = '/default-avatar.png'}
              />
            </div>

            <div className="info">
              <h1 className="name">{user.username}</h1>
              <p className="username">@{user.username}</p>

              <div className="stats">
                <div><strong>{posts.length}</strong> Bài viết</div>
                <div className="clickable" onClick={() => navigate(`/users/${user.id}/followers`)}>
                  <strong>{followCount}</strong> Người theo dõi
                </div>
                <div className="clickable" onClick={() => navigate(`/users/${user.id}/following`)}>
                  <strong>{followingCount}</strong> Đang theo dõi
                </div>
              </div>

              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>SĐT:</strong> {user.phone || 'Chưa cập nhật'}</p>

              <div className="bio-section">
                <strong>Tiểu sử:</strong>
                {currentUserId === user.id && isEditingBio ? (
                  <div className="bio-edit">
                    <input
                      value={bio}
                      onChange={handleBioChange}
                      placeholder="Nhập tiểu sử..."
                      className="bio-input"
                      disabled={processing}
                    />
                    <button onClick={handleBioSave} className="bio-save-button" disabled={processing}>Lưu</button>
                  </div>
                ) : (
                  <div className="bio-display">
                    <p>{bio}</p>
                    {currentUserId === user.id && (
                      <span className="edit-icon" onClick={handleBioEdit} title="Chỉnh sửa tiểu sử">✏️</span>
                    )}
                  </div>
                )}
              </div>

              {user.id !== currentUserId && (
                <button
                  onClick={toggleFollow}
                  disabled={processing}
                  className={`follow-button ${isFollowing ? 'following' : ''}`}
                >
                  {isFollowing ? 'Đã theo dõi' : 'Theo dõi'}
                </button>
              )}
            </div>
          </div>

          <div className="user-posts">
            <h2>Bài viết</h2>
            {posts.length === 0 ? (
              <p className="no-posts">Người dùng chưa có bài viết nào.</p>
            ) : (
              <div className="posts-list">
                {posts.map(post => (
                  <div key={post.id} className="post-card">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    {post.image && (
                      <img
                        src={`http://localhost:8000/storage/posts/${post.image}`}
                        alt={`Hình bài viết ${post.title}`}
                        className="post-image"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
