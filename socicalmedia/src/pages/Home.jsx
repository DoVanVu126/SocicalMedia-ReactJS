import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../style/Home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId] = useState(2); // Tạm thời user_id = 2
  const [selectedReactions, setSelectedReactions] = useState({}); // Lưu trạng thái phản ứng cho mỗi bài viết

  useEffect(() => {
    axios.get('http://localhost:8000/api/posts')
      .then(res => {
        setPosts(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const handleReactionClick = (postId, reactionType = null) => {
    setLoading(true);
    const post = posts.find(p => p.id === postId);
    const userReaction = post?.reactions?.find(r => r.user_id === userId);

    if (userReaction && reactionType === null) {
      // Xóa phản ứng nếu click vào nút "Thích" và đã có phản ứng
      axios.delete(`http://localhost:8000/api/posts/${postId}/reactions/${userReaction.id}`)
        .then(response => {
          const updatedPosts = posts.map(post =>
            post.id === postId
              ? { ...post, reactions: post.reactions.filter(r => r.id !== userReaction.id) }
              : post
          );
          setPosts(updatedPosts);
          setSelectedReactions(prev => ({ ...prev, [postId]: null }));
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to delete reaction', error);
          setLoading(false);
        });
    } else if (userReaction && userReaction.type === reactionType) {
      // Xóa phản ứng nếu chọn lại cùng một loại cảm xúc
      axios.delete(`http://localhost:8000/api/posts/${postId}/reactions/${userReaction.id}`)
        .then(response => {
          const updatedPosts = posts.map(post =>
            post.id === postId
              ? { ...post, reactions: post.reactions.filter(r => r.id !== userReaction.id) }
              : post
          );
          setPosts(updatedPosts);
          setSelectedReactions(prev => ({ ...prev, [postId]: null }));
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to delete reaction', error);
          setLoading(false);
        });
    } else {
      if (userReaction) {
        // Cập nhật phản ứng nếu đã có phản ứng trước đó
        axios.post(`http://localhost:8000/api/posts/${postId}/reactions/update`, {
          post_id: postId,
          type: reactionType,
          user_id: userId,
        })
        .then(response => {
          const updatedPosts = posts.map(post =>
            post.id === postId
              ? {
                  ...post,
                  reactions: post.reactions.map(r =>
                    r.user_id === userId ? { ...r, type: reactionType } : r
                  ),
                }
              : post
          );
          setPosts(updatedPosts);
          setSelectedReactions(prev => ({ ...prev, [postId]: reactionType }));
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to update reaction', error);
          setLoading(false);
        });
      } else {
        // Thêm phản ứng mới nếu chưa có
        axios.post('http://localhost:8000/api/reactions', {
          post_id: postId,
          type: reactionType,
          user_id: userId,
        })
        .then(response => {
          const updatedPosts = posts.map(post =>
            post.id === postId
              ? { ...post, reactions: [...(post.reactions || []), response.data] }
              : post
          );
          setPosts(updatedPosts);
          setSelectedReactions(prev => ({ ...prev, [postId]: reactionType }));
          setLoading(false);
        })
        .catch(error => {
          console.error('Failed to add reaction', error);
          setLoading(false);
        });
      }
    }
  };

  const renderReaction = (reaction) => {
    switch (reaction) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'haha': return '😂';
      case 'wow': return '😲';
      case 'sad': return '😢';
      case 'angry': return '😡';
      default: return '👍';
    }
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="main">
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map(post => (
            <div className="post" key={post.id}>
              <div className="post-header">
                <div className="user-info">
                  <img
                    src={`http://localhost:8000/storage/image/${post.user?.profilepicture || 'default-avatar.png'}`}
                    alt="Avatar"
                    className="avatar"
                  />
                  <div>
                    <strong>{post.user?.username || 'Người dùng'}</strong><br />
                    <small>{new Date(post.created_at).toLocaleString()}</small>
                  </div>
                </div>

                <div className="post-options">
                  <details>
                    <summary className="options-btn">⋯</summary>
                    <div className="options-menu">
                      <button>📝 Sửa</button>
                      <button onClick={() => alert("Bạn có chắc chắn muốn xóa không?")}>🗑️ Xóa</button>
                    </div>
                  </details>
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
                {post.reactions && post.reactions.length > 0 && (
                  <div className="reaction-summary">
                    <span>{renderReaction(post.reactions[0].type)}</span>
                    <span>{post.reactions.length}</span>
                  </div>
                )}
                <button
                  onClick={() => handleReactionClick(post.id)}
                  className="like-button"
                >
                  {selectedReactions[post.id] ? renderReaction(selectedReactions[post.id]) : '👍 Thích'}
                </button>

                <div className="reaction-icons">
                  {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map(reaction => (
                    <button
                      key={reaction}
                      onClick={() => handleReactionClick(post.id, reaction)}
                      className="reaction-icon"
                    >
                      {renderReaction(reaction)}
                    </button>
                  ))}
                </div>

                <button>💬 Bình luận</button>
                <button>🔗 Chia sẻ</button>
              </div>
            </div>
          ))
        ) : (
          <p>Không có bài viết nào</p>
        )}

        {loading && <p>⏳ Đang xử lý...</p>}
      </div>
    </div>
  );
}