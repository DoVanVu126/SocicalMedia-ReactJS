import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../style/Home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId] = useState(2); // Tạm thời hardcode, thay bằng localStorage sau
  const [showReactions, setShowReactions] = useState(null); // Kiểm soát hiển thị hộp reaction

  // Lấy danh sách bài viết
  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:8000/api/posts', { params: { user_id: userId } })
      .then(res => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi lấy bài viết:', err);
        setError('Không thể tải bài viết');
        setLoading(false);
      });
  }, [userId]);

  // Hàm render biểu tượng cảm xúc
  const renderReaction = (type) => {
    const icons = {
      like: '👍',
      love: '❤️',
      haha: '😂',
      wow: '😲',
      sad: '😢',
      angry: '😡',
    };
    return icons[type] || '👍';
  };

  // Hàm render nhãn của nút (bao gồm biểu tượng và tên)
  const renderButtonLabel = (userReaction) => {
    if (!userReaction) {
      return '👍 Like'; // Mặc định hiển thị "👍 Like" khi chưa có reaction
    }
    const type = userReaction.type;
    const labels = {
      like: '👍 Like',
      love: '❤️ Love',
      haha: '😂 Haha',
      wow: '😲 Wow',
      sad: '😢 Sad',
      angry: '😡 Angry',
    };
    return labels[type] || '👍 Like';
  };

  // Xử lý click reaction
  const handleReactionClick = async (postId, reactionType = null) => {
    const post = posts.find(p => p.id === postId);
    const userReaction = post?.user_reaction;

    // Cập nhật state trước để giao diện phản hồi ngay
    let newPosts = [...posts];
    let updatedPost = { ...post };

    if (userReaction) {
      if (reactionType === null || userReaction.type === reactionType) {
        // Xóa reaction nếu click lại cùng loại hoặc nút "Thích"
        updatedPost = {
          ...updatedPost,
          user_reaction: null,
          reaction_summary: {
            ...updatedPost.reaction_summary,
            [userReaction.type]: (updatedPost.reaction_summary[userReaction.type] || 1) - 1,
          },
        };
      } else {
        // Cập nhật reaction sang loại mới
        updatedPost = {
          ...updatedPost,
          user_reaction: { user_id: userId, post_id: postId, type: reactionType },
          reaction_summary: {
            ...updatedPost.reaction_summary,
            [userReaction.type]: (updatedPost.reaction_summary[userReaction.type] || 1) - 1,
            [reactionType]: (updatedPost.reaction_summary[reactionType] || 0) + 1,
          },
        };
      }
    } else if (reactionType || reactionType === null) {
      // Thêm reaction "like" nếu chưa có reaction và click nút "Thích"
      const newReactionType = reactionType || 'like';
      updatedPost = {
        ...updatedPost,
        user_reaction: { user_id: userId, post_id: postId, type: newReactionType },
        reaction_summary: {
          ...updatedPost.reaction_summary,
          [newReactionType]: (updatedPost.reaction_summary[newReactionType] || 0) + 1,
        },
      };
    }

    // Cập nhật state ngay lập tức
    newPosts = newPosts.map(p => (p.id === postId ? updatedPost : p));
    setPosts(newPosts);
    setShowReactions(null); // Ẩn hộp reaction sau khi chọn

    // Gửi API để xác nhận
    try {
      if (userReaction && (reactionType === null || userReaction.type === reactionType)) {
        // Xóa reaction
        await axios.delete(`http://localhost:8000/api/posts/${postId}/react`, {
          data: { user_id: userId },
        });
      } else if (reactionType || reactionType === null) {
        // Thêm hoặc cập nhật reaction (mặc định là "like" nếu reactionType là null)
        const newReactionType = reactionType || 'like';
        await axios.post(`http://localhost:8000/api/posts/${postId}/react`, {
          user_id: userId,
          type: newReactionType,
        });
      }
    } catch (err) {
      console.error('Lỗi khi xử lý reaction:', err);
      setError('Không thể xử lý reaction');
      // Hoàn nguyên state nếu API thất bại
      setPosts(posts);
    } finally {
      setLoading(false);
    }
  };

  // Tính tổng số reaction
  const getTotalReactions = (summary) => {
    return Object.values(summary || {}).reduce((sum, count) => sum + count, 0);
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="main">
        {loading && <p className="loading">⏳ Đang tải...</p>}
        {error && <p className="error">{error}</p>}
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map(post => (
            <div className="post" key={post.id}>
              <div className="post-header">
                <div className="user-info">
                  <img
                    src={
                      post.user?.profilepicture
                        ? `http://localhost:8000/storage/images/${post.user.profilepicture}`
                        : '/default-avatar.png'
                    }
                    alt="Avatar"
                    className="avatar"
                  />
                  <div>
                    <strong>{post.user?.username || 'Người dùng'}</strong>
                    <br />
                    <small>{new Date(post.created_at).toLocaleString()}</small>
                  </div>
                </div>
                <div className="post-options">
                  <button
                    className="options-btn"
                    onClick={() =>
                      setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)
                    }
                  >
                    ⋯
                  </button>
                  {activeMenuPostId === post.id && (
                    <div className="options-menu">
                      <button onClick={() => alert('Chức năng sửa chưa được triển khai')}>
                        📝 Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                            setLoading(true);
                            axios
                              .delete(`http://localhost:8000/api/posts/${post.id}`, {
                                data: { user_id: userId },
                              })
                              .then(() => {
                                setPosts(posts.filter(p => p.id !== post.id));
                              })
                              .catch(err => {
                                console.error('Lỗi khi xóa bài viết:', err);
                                setError('Không thể xóa bài viết');
                              })
                              .finally(() => setLoading(false));
                          }
                        }}
                      >
                        🗑️ Xóa
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p className="post-content">{post.content}</p>

              <div className="media-wrapper">
                {post.imageurl && (
                  <img src={post.imageurl} alt="Ảnh bài viết" className="post-image" />
                )}
                {post.videourl && (
                  <video controls className="post-video">
                    <source src={post.videourl} type="video/mp4" />
                  </video>
                )}
              </div>

              <div className="actions">
                {post.user_reaction && (
                  <div className="reaction-summary">
                    <span className="reaction-icon">
                      {renderReaction(post.user_reaction.type)}
                    </span>
                    <span>{getTotalReactions(post.reaction_summary)}</span>
                  </div>
                )}

                <div
                  className="reaction-container"
                  onMouseEnter={() => setShowReactions(post.id)}
                  onMouseLeave={() => setShowReactions(null)}
                >
                  <button
                    className={`like-button ${post.user_reaction ? 'reacted' : ''}`}
                    onClick={() => handleReactionClick(post.id)}
                  >
                    {renderButtonLabel(post.user_reaction)}
                  </button>
                  {showReactions === post.id && (
                    <div className="reaction-icons">
                      {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map(type => (
                        <button
                          key={type}
                          className={`reaction-icon ${
                            post.user_reaction?.type === type ? 'selected' : ''
                          }`}
                          onClick={() => handleReactionClick(post.id, type)}
                          title={type.charAt(0).toUpperCase() + type.slice(1)}
                        >
                          {renderReaction(type)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={() => alert('Chức năng bình luận chưa được triển khai')}>
                  💬 Bình luận
                </button>
                <button onClick={() => alert('Chức năng chia sẻ chưa được triển khai')}>
                  🔗 Chia sẻ
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading && <p>Không có bài viết nào</p>
        )}
      </div>
    </div>
  );
}