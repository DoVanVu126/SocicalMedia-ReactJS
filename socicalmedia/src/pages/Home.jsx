import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../style/Home.css";
import StoryViewer from "../components/StoryViewer";
import { initBlinkText } from '../script';


export default function Home() {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };
  const handleEditClick = (index, currentContent, commentId) => {
    setEditingIndex(index);
    setEditContent(currentContent);
    setOpenMenuIndex(null); // đóng menu
    setSelectedCommentId(commentId); // Lưu trữ commentId
  };

  // Thêm state để theo dõi commentId đang được chỉnh sửa/xóa
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const handleSaveEdit = async () => {
    if (editingIndex === null || selectedCommentPostId === null || selectedCommentId === null) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/posts/${selectedCommentPostId}/comments/${selectedCommentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: editContent,
            user_id: userIDCMT, // Đảm bảo bạn có userIDCMT từ localStorage hoặc state
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lỗi sửa bình luận:', errorData);
        setError('Không thể sửa bình luận.');
        return;
      }

      const updatedComment = await response.json();

      // Cập nhật state comments với nội dung đã sửa
      setComments(prevComments => {
        const updatedComments = { ...prevComments };
        if (updatedComments[selectedCommentPostId]) {
          const commentIndex = updatedComments[selectedCommentPostId].findIndex(
            (cmt) => cmt.id === selectedCommentId
          );
          if (commentIndex !== -1) {
            updatedComments[selectedCommentPostId][commentIndex] = updatedComment;
          }
        }
        return updatedComments;
      });

      setEditingIndex(null);
      setEditContent('');
      setSelectedCommentId(null);
    } catch (error) {
      console.error('Lỗi kết nối khi sửa bình luận:', error);
      setError('Lỗi kết nối khi sửa bình luận.');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/posts/${selectedCommentPostId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userIDCMT, // Đảm bảo bạn có userIDCMT
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Lỗi xóa bình luận:', errorData);
        setError('Không thể xóa bình luận.');
        return;
      }

      // Cập nhật state comments sau khi xóa thành công
      setComments(prevComments => {
        const updatedComments = { ...prevComments };
        if (updatedComments[selectedCommentPostId]) {
          updatedComments[selectedCommentPostId] = updatedComments[selectedCommentPostId].filter(
            (comment) => comment.id !== commentId
          );
        }
        return updatedComments;
      });

      setOpenMenuIndex(null);
    } catch (error) {
      console.error('Lỗi kết nối khi xóa bình luận:', error);
      setError('Lỗi kết nối khi xóa bình luận.');
    }
  };
  const [expandedPosts, setExpandedPosts] = useState({}); // lưu trạng thái mở rộng của từng post theo id hoặc index

// Hàm toggle mở rộng ảnh cho post
const toggleExpandImages = (postId) => {
  setExpandedPosts(prev => ({
    ...prev,
    [postId]: !prev[postId],
  }));
};

const [posts, setPosts] = useState([]);

const navigate = useNavigate();

const handleEdit = (post) => {
  navigate(`/edit-post/${post.id}`, {
    state: {
      content: post.content,
      imageUrl: post.imageurl,
      videoUrl: post.videourl,
    },
  });
};


  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const reactionListRef = useRef(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReactions, setShowReactions] = useState(null);
  const [stories, setStories] = useState([]);
  const [showMenu, setShowMenu] = useState(null);
  const [reactionList, setReactionList] = useState({});
  const [showReactionList, setShowReactionList] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const userIDCMT = user?.id;
   
  useEffect(() => {
      // Gọi initBlinkText khi component mount
      initBlinkText();
    }, []);

  useEffect(() => {
    if (!userIDCMT) return;
    setLoading(true);
    axios
      .get("http://localhost:8000/api/stories", {
        params: { user_id: userIDCMT },
      })
      .then((res) => {
        setStories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải story:", err);
        setError("Không thể tải story");
        setLoading(false);
      });
  }, [userIDCMT]);

  useEffect(() => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để thực hiện hành động này");
      return;
    }
    setLoading(true);
    axios
      .get("http://localhost:8000/api/posts", {
        params: { user_id: userIDCMT },
      })
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy bài viết:", err);
        setError("Không thể tải bài viết");
        setLoading(false);
      });
  }, [userIDCMT]);

  const handleDeleteStory = (id) => {
    axios
      .delete(`http://localhost:8000/api/stories/${id}`)
      .then(() => {
        setStories(stories.filter((story) => story.id !== id));
      })
      .catch((err) => {
        console.error("Lỗi khi xóa story:", err);
        setError("Không thể xóa story");
      });
  };

  const handleToggleMenu = (storyId) => {
    setShowMenu(showMenu === storyId ? null : storyId);
  };

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return date.toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const handleCommentSubmit = async (postId) => {
    const content = commentInputs[postId];
    if (!content) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userIDCMT,
            content,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Lỗi từ server: ${res.status} - ${errorText}`);
      }

      await fetchComments(postId);
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (error) {
      console.error("Lỗi gửi bình luận:", error.message);
      setError("Không thể gửi bình luận");
    }
  };

  const fetchComments = async (postId) => {
    const res = await fetch(
      `http://localhost:8000/api/posts/${postId}/comments`
    );
    const data = await res.json();
    setComments((prev) => ({ ...prev, [postId]: data }));
  };

  const fetchReactionList = async (postId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/posts/${postId}/reactions`
      );
      setReactionList((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Lỗi khi lấy danh sách cảm xúc:", err);
      setError("Không thể tải danh sách cảm xúc");
    }
  };

  const handleReactionSummaryClick = (postId) => {
    if (showReactionList === postId) {
      setShowReactionList(null);
    } else {
      fetchReactionList(postId);
      setShowReactionList(postId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeMenuPostId !== null &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setActiveMenuPostId(null);
      }
      if (
        showReactionList !== null &&
        reactionListRef.current &&
        !reactionListRef.current.contains(event.target)
      ) {
        setShowReactionList(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuPostId, showReactionList]);

  const renderReaction = (type) => {
    const icons = {
      like: "👍",
      love: "❤️",
      haha: "😂",
      wow: "😲",
      sad: "😢",
      angry: "😡",
    };
    return icons[type] || "👍";
  };

  const renderButtonLabel = (userReaction) => {
    if (!userReaction) {
      return "👍 Like";
    }
    const type = userReaction.type;
    const labels = {
      like: "👍 Like",
      love: "❤️ Love",
      haha: "😂 Haha",
      wow: "😲 Wow",
      sad: "😢 Sad",
      angry: "😡 Angry",
    };
    return labels[type] || "👍 Like";
  };

  const handleReactionClick = async (postId, reactionType = null) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để thực hiện hành động này");
      return;
    }

    const post = posts.find((p) => p.id === postId);
    const userReaction = post?.user_reaction;

    let newPosts = [...posts];
    let updatedPost = { ...post };

    if (userReaction) {
      if (reactionType === null || userReaction.type === reactionType) {
        updatedPost = {
          ...updatedPost,
          user_reaction: null,
          reaction_summary: {
            ...updatedPost.reaction_summary,
            [userReaction.type]:
              (updatedPost.reaction_summary[userReaction.type] || 1) - 1,
          },
        };
      } else {
        updatedPost = {
          ...updatedPost,
          user_reaction: {
            user_id: userIDCMT,
            post_id: postId,
            type: reactionType,
          },
          reaction_summary: {
            ...updatedPost.reaction_summary,
            [userReaction.type]:
              (updatedPost.reaction_summary[userReaction.type] || 1) - 1,
            [reactionType]:
              (updatedPost.reaction_summary[reactionType] || 0) + 1,
          },
        };
      }
    } else if (reactionType || reactionType === null) {
      const newReactionType = reactionType || "like";
      updatedPost = {
        ...updatedPost,
        user_reaction: {
          user_id: userIDCMT,
          post_id: postId,
          type: newReactionType,
        },
        reaction_summary: {
          ...updatedPost.reaction_summary,
          [newReactionType]:
            (updatedPost.reaction_summary[newReactionType] || 0) + 1,
        },
      };
    }

    newPosts = newPosts.map((p) => (p.id === postId ? updatedPost : p));
    setPosts(newPosts);
    setShowReactions(null);

    try {
      if (
        userReaction &&
        (reactionType === null || userReaction.type === reactionType)
      ) {
        await axios.delete(`http://localhost:8000/api/posts/${postId}/react`, {
          data: { user_id: userIDCMT },
        });
      } else if (reactionType || reactionType === null) {
        const newReactionType = reactionType || "like";
        await axios.post(`http://localhost:8000/api/posts/${postId}/react`, {
          user_id: userIDCMT,
          type: newReactionType,
        });
      }
    } catch (err) {
      console.error("Lỗi khi xử lý reaction:", err);
      setError("Không thể xử lý reaction");
      setPosts(posts);
    } finally {
      setLoading(false);
    }
  };

  const getTotalReactions = (summary) => {
    return Object.values(summary || {}).reduce((sum, count) => sum + count, 0);
  };

  const handleOpenViewer = (index) => {
    setSelectedIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <div className="container">
           <Header/>
      <Sidebar />
      <div className="main">
        <div className="story-containers">
          <h3 className="story-header blink-text">Bảng tin</h3>
          {loading && <p className="loading">⏳ Đang tải...</p>}
          <div className="story-list">
            <div
              className="story-item create-story"
              onClick={() => navigate("/story")}
            >
              <div className="story-user-info">
                <img
                  src={
                    user?.profilepicture
                      ? `http://localhost:8000/storage/images/${user.profilepicture}`
                      : "/default-avatar.png"
                  }
                  alt="Avatar"
                  className="story-avatar"
                />
                <div className="story-user-details">
                  <span className="story-username">Tạo tin ➕</span>
                </div>
              </div>
            </div>
            {stories.map((story, index) => (
              <div
                key={story.id}
                className="story-item"
                onClick={() => handleOpenViewer(index)}
              >
                <div className="story-user-info">
                  <img
                    src={
                      story.user?.profilepicture
                        ? `http://localhost:8000/storage/images/${story.user.profilepicture}`
                        : "/default-avatar.png"
                    }
                    alt="Avatar"
                    className="story-avatar"
                  />
                  <div className="story-user-details">
                    <span className="story-username">{story.user?.username || "Người dùng"}</span>
                    <span className="story-time">{formatTime(story.created_at)}</span>
                  </div>
                </div>
                  <button
                      className="story-menu-btn"
                      onClick={() => handleToggleMenu(story.id)}
                    >  ⋮
                      
                    </button>
                     {showMenu === story.id && story.user?.id === user?.id && (
                      <div className="story-menu" ref={menuRef}>
                        <button
                          className="story-menu-item"
                          onClick={() => handleDeleteStory(story.id)}
                        >
                          🗑️ Xóa Story
                        </button>
                      </div>
                    )}
                <div className="story-image-wrapper">
                  {story.videourl?.match(/\.(mp4|webm)$/i) ? (
                    <video
                      src={`http://localhost:8000/storage/story_videos/${story.videourl}`}
                      className="story-image"
                      muted
                    />
                  ) : (
                    <img
                      src={`http://localhost:8000/storage/story_images/${story.imageurl}`}
                      alt="Story"
                      className="story-image"
                    />
                  )}
                </div>
                <div className="story-content">
                  <p className="text">{story.content}</p>
                  <div className="story-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                  
                   
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isViewerOpen && (
            <StoryViewer
              stories={stories}
              onClose={() => setIsViewerOpen(false)}
              initialIndex={selectedIndex}
            />
          )}
        </div>

        {loading && <p className="loading">⏳ Đang tải...</p>}
        {error && <p className="error">{error}</p>}
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => (
            <div className="post" key={post.id}>
              <div className="post-header">
                <div className="user-info">
                  <img
                    src={
                      post.user?.profilepicture
                        ? `http://localhost:8000/storage/images/${post.user.profilepicture}`
                        : "/default-avatar.png"
                    }
                    alt="Avatar"
                    className="avatar"
                  />
                  <div>
                    <strong>{post.user?.username || "Người dùng"}</strong>
                    <br />
                    <small>{new Date(post.created_at).toLocaleString()}</small>
                  </div>
                </div>
                <div className="post-options">
                  <button
                    ref={buttonRef}
                    className="options-btn"
                    onClick={() =>
                      setActiveMenuPostId(
                        activeMenuPostId === post.id ? null : post.id
                      )
                    }
                  >
                    ⋯
                  </button>
                  {activeMenuPostId === post.id && post.user?.id === user?.id && (
                    <div className="options-menu" ref={menuRef}>
                      <button onClick={() => handleEdit(post)}>📝 Sửa</button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Bạn có chắc muốn xóa bài viết này?"
                            )
                          ) {
                            setLoading(true);
                            axios
                              .delete(
                                `http://localhost:8000/api/posts/${post.id}`,
                                {
                                  data: { user_id: userIDCMT },
                                }
                              )
                              .then(() => {
                                setPosts(
                                  posts.filter((p) => p.id !== post.id)
                                );
                              })
                              .catch((err) => {
                                console.error("Lỗi khi xóa bài viết:", err);
                                setError("Không thể xóa bài viết");
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

              <div key={post.id} className="post-media">
                {Array.isArray(post.imageurl) && (
                  <>
                    {(expandedPosts[post.id] ? post.imageurl : post.imageurl.slice(0, 4)).map((img, index) => (
                      <div key={index} className="image-wrapper">
                        {/* Overlay đen nhạt khi hover */}
                        <div className="media-overlay-black"></div>
                        <div className="media-overlay-hover"></div>
                        {/* Ảnh */}
                        <img
                          src={`http://localhost:8000/storage/images/${img}`}
                          alt={`Ảnh ${index + 1}`}
                          className="media-image"
                        />
                        {/* Overlay +x ảnh */}
                        {index === 3 && post.imageurl.length > 4 && !expandedPosts[post.id] && (
                          <div
                            className="image-overlay"
                            onClick={() => toggleExpandImages(post.id)}
                          >
                            +{post.imageurl.length - 4} ảnh
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Nút thu gọn */}
                    {expandedPosts[post.id] && (
                      <button onClick={() => toggleExpandImages(post.id)} className="collapse-btn">
                        Thu gọn
                      </button>
                    )}
                  </>
                )}

                {/* Video */}
                {post.videourl && (
                  <div className="video-wrapper">
                    <div className="media-overlay-hover"></div>
                    <video controls className="media-video">
                      <source
                        src={`http://localhost:8000/storage/videos/${post.videourl}`}
                        type="video/mp4"
                      />
                      Trình duyệt của bạn không hỗ trợ video.
                    </video>
                  </div>
                )}
              </div>


              <div className="actions">
                {getTotalReactions(post.reaction_summary) > 0 && (
                  <div className="reaction-summary">
                    <span
                      className="reaction-icon"
                      onClick={() => handleReactionSummaryClick(post.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {Object.keys(post.reaction_summary).map((type) =>
                        post.reaction_summary[type] > 0 ? (
                          <span key={type}>{renderReaction(type)}</span>
                        ) : null
                      )}
                    </span>
                    <span
                      onClick={() => handleReactionSummaryClick(post.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {getTotalReactions(post.reaction_summary)}
                    </span>
                    {showReactionList === post.id && (
                      <div className="reaction-list" ref={reactionListRef}>
                        <div className="reaction-list-header">
                          <span>
                            {getTotalReactions(post.reaction_summary)} lượt thả
                            cảm xúc
                          </span>
                          <button
                            className="close-button"
                            onClick={() => setShowReactionList(null)}
                          >
                            ×
                          </button>
                        </div>
                        <div className="reaction-counts">
                          {Object.keys(post.reaction_summary).map(
                            (type) =>
                              post.reaction_summary[type] > 0 && (
                                <span key={type} className="reaction-count">
                                  {renderReaction(type)}{" "}
                                  {post.reaction_summary[type]}
                                </span>
                              )
                          )}
                        </div>
                        <div className="reaction-users">
                          {reactionList[post.id]?.length > 0 ? (
                            reactionList[post.id].map((reaction, index) => (
                              <div key={index} className="reaction-user">
                                <img
                                  src={
                                    reaction.user?.profilepicture
                                      ? `http://localhost:8000/storage/images/${reaction.user.profilepicture}`
                                      : "/default-avatar.png"
                                  }
                                  alt="Avatar"
                                  className="reaction-user-avatar"
                                />
                                <span>
                                  {reaction.user?.username || reaction.username}
                                </span>
                                : {renderReaction(reaction.type)}
                              </div>
                            ))
                          ) : (
                            <p>Không có cảm xúc nào</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className="reaction-container"
                  onMouseEnter={() => setShowReactions(post.id)}
                  onMouseLeave={() => setShowReactions(null)}
                >
                  <button
                    className={`like-button ${
                      post.user_reaction ? "reacted" : ""
                    }`}
                    onClick={() => handleReactionClick(post.id)}
                  >
                    {renderButtonLabel(post.user_reaction)}
                  </button>
                  {showReactions === post.id && (
                    <div className="reaction-icons">
                      {["like", "love", "haha", "wow", "sad", "angry"].map(
                        (type) => (
                          <button
                            key={type}
                            className={`reaction-icon ${
                              post.user_reaction?.type === type ? "selected" : ""
                            }`}
                            onClick={() => handleReactionClick(post.id, type)}
                            title={type.charAt(0).toUpperCase() + type.slice(1)}
                          >
                            {renderReaction(type)}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (selectedCommentPostId === post.id) {
                      setSelectedCommentPostId(null);
                    } else {
                      fetchComments(post.id);
                      setSelectedCommentPostId(post.id);
                    }
                  }}
                >
                  💬 Bình luận
                </button>
                <button
                  onClick={() =>
                    alert("Chức năng chia sẻ chưa được triển khai")
                  }
                >
                  🔗 Chia sẻ
                </button>
              </div>
              {selectedCommentPostId === post.id && (
                <>
                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Viết bình luận..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({
                          ...commentInputs,
                          [post.id]: e.target.value,
                        })
                      }
                    />
                    <button onClick={() => handleCommentSubmit(post.id)}>
                      Gửi
                    </button>
                  </div>

                                    <div className="comments">
                    {comments[post.id]?.map((comment, index) => (
                      <div key={index} className="comment">
                        <strong>{comment.user?.username || "Người dùng"}:</strong>{" "}
                        {editingIndex === index ? (
                          <>
                            <input
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                            />
                            <button onClick={handleSaveEdit}>Lưu</button>
                            <button onClick={() => setEditingIndex(null)}>Hủy</button>
                          </>
                        ) : (
                          comment.content
                        )}

                        <div className="comment-actions">
                          {comment.user?.id === userIDCMT && (
                            <>
                              <button className="btn-more" onClick={() => toggleMenu(index)}>...</button>
                              <div className="comment-menu" style={{ display: openMenuIndex === index ? "block" : "none" }}>
                                <button className="edit-btn" onClick={() => handleEditClick(index, comment.content, comment.id)}>Sửa</button>
                                <button className="delete-btn" onClick={() => handleDelete(comment.id)}>Xóa</button>
                              </div>
                            </>
                          )}
                        </div>
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