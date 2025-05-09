import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../style/Home.css';

export default function Home() {
  const [openMenuCommentId, setOpenMenuCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId] = useState(2); // Tạm thời hardcode, thay bằng localStorage sau

  const user = JSON.parse(localStorage.getItem('user'));
  const userIDCMT = user?.id;
  
  const [showReactions, setShowReactions] = useState(null); // Kiểm soát hiển thị hộp reaction

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await axios.delete(`http://localhost:8000/api/posts/${postId}/comments/${commentId}`, {
        data: { user_id: userIDCMT },
      });

      await fetchComments(postId); // Load lại bình luận sau khi xóa
    } catch (error) {
      console.error('Lỗi khi xóa bình luận:', error.message);
      setError('Không thể xóa bình luận');
    }
  };


  const handleSaveEdit = async (postId, commentId) => {
    try {
      await axios.put(`http://localhost:8000/api/posts/${postId}/comments/${commentId}`, {
        user_id: userIDCMT,
        content: editedContent,
      });

      setEditingCommentId(null);
      setEditedContent('');
      await fetchComments(postId);
    } catch (error) {
      console.error('Lỗi khi sửa bình luận:', error.message);
      setError('Không thể sửa bình luận');
    }
  };


  //Hàm thêm Bình Luận
  const handleCommentSubmit = async (postId) => {
    const content = commentInputs[postId];
    if (!content) return;

    try {
      const res = await fetch(`http://localhost:8000/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userIDCMT, // ✅ Gửi userIDCMT từ localStorage
          content,
        }),
      });

      console.log('Response:', await res.json());

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Lỗi từ server: ${res.status} - ${errorText}`);
      }

      await fetchComments(postId);
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) {
      console.error('Lỗi gửi bình luận:', error.message);
      setError('Không thể gửi bình luận');
    }
  };

  // Hàm Bình Luận
  const fetchComments = async (postId) => {
    const res = await fetch(`http://localhost:8000/api/posts/${postId}/comments`);
    const data = await res.json();
    setComments(prev => ({ ...prev, [postId]: data }));
  };


  // Đóng menu ...
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Nếu menu đang mở và click nằm ngoài menu và nút 3 chấm thì đóng menu
      if (
        activeMenuPostId !== null &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setActiveMenuPostId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuPostId]);

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
                    ref={buttonRef}
                    className="options-btn"
                    onClick={() =>
                      setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)
                    }
                  >
                    ⋯
                  </button>
                  {activeMenuPostId === post.id && (
                    <div className="options-menu" ref={menuRef}>
                      <button onClick={() => alert('Chức năng sửa chưa được triển khai')}>
                        📝 Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                            setLoading(true);
                            axios
                              .delete(`http://localhost:8000/api/posts/${post.id}`, {
                                data: { user_id: userIDCMT },  // Nếu cần, gửi user_id
                              })
                              .then((response) => {
                                console.log('Xóa thành công:', response);
                                // Xóa bài post và bình luận ở frontend
                                setPosts(posts.filter(p => p.id !== post.id));
                              })
                              .catch((err) => {
                                console.error('Lỗi khi xóa bài viết:', err.response || err);
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

              <div className="post-media">
                {post.imageurl && (
                  <div className="image-wrapper">
                    <img
                      src={`http://localhost:8000/storage/images/${post.imageurl}`}
                      alt="Ảnh bài viết"
                      className="media-image"
                    />
                  </div>
                )}

                {post.videourl && (
                  <div className="video-wrapper">
                    <video controls className="media-video">
                      <source src={`http://localhost:8000/storage/videos/${post.videourl}`} type="video/mp4" />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  </div>
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
                          className={`reaction-icon ${post.user_reaction?.type === type ? 'selected' : ''
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

                <button
                  onClick={() => {
                    if (selectedCommentPostId === post.id) {
                      setSelectedCommentPostId(null); // ẩn nếu nhấn lại
                    } else {
                      fetchComments(post.id);         // tải bình luận nếu chưa tải
                      setSelectedCommentPostId(post.id);
                    }
                  }}
                >
                  💬 Bình luận
                </button>

                <button onClick={() => alert('Chức năng chia sẻ chưa được triển khai')}>
                  🔗 Chia sẻ
                </button>
              </div>
              {selectedCommentPostId === post.id && (
                <>
                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Viết bình luận..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                    />
                    <button onClick={() => handleCommentSubmit(post.id)}>Gửi</button>
                  </div>
                  <div className="comments">
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="comment">
                        <strong>{comment.user?.username || 'Người dùng'}:</strong>
                        {editingCommentId === comment.id ? (
                          <>
                            <input
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                            />
                            <button onClick={() => handleSaveEdit(post.id, comment.id)}>Lưu</button>
                            <button onClick={() => setEditingCommentId(null)}>Hủy</button>
                          </>
                        ) : (
                          <>
                            <span> {comment.content}</span>
                            <div className="comment-actions">
                              <button onClick={() =>
                                setOpenMenuCommentId(openMenuCommentId === comment.id ? null : comment.id)
                              }>
                                ...
                              </button>
                              {openMenuCommentId === comment.id && comment.user_id === userIDCMT && (
                                <div className="comment-menu">
                                  <button onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditedContent(comment.content);
                                    setOpenMenuCommentId(null);
                                  }}>✏️ Sửa</button>
                                  <button onClick={() => {
                                    handleDeleteComment(post.id, comment.id);
                                    setOpenMenuCommentId(null);
                                  }}>🗑️ Xóa</button>
                                </div>
                              )}
                            </div>

                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

            </div>
          ))
        ) : (
          !loading && <p>Không có bài viết nào</p>
        )}
      </div>
    </div>
  );
}