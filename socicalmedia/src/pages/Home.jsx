import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../style/Home.css";
import "../style/Notification.css";
import "../style/HomeNotification.css";
import StoryViewer from "../components/StoryViewer";
import { initBlinkText, sparkleMouseEffect, initRippleEffect } from "../script";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showReactions, setShowReactions] = useState(null);
  const [stories, setStories] = useState([]);
  const [showMenu, setShowMenu] = useState(null);
  const [reactionList, setReactionList] = useState({});
  const [showReactionList, setShowReactionList] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);
  const [deletingStoryId, setDeletingStoryId] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 10;
  const [showNavButtons, setShowNavButtons] = useState(false); // Ví dụ giá trị khởi tạo
  const user = JSON.parse(localStorage.getItem("user"));
  const userIDCMT = user?.id;
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const reactionListRef = useRef(null);
  const storyListRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchPosts = async (page) => {
    setLoading(true);
    try {
      const res = await axios.get(`/posts?page=${page}&limit=${postsPerPage}`);
      setPosts(res.data.posts);
      setTotalPosts(res.data.totalPosts);
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  const introText = "SocialMediaApp".split("").map((letter, index) => ({
    letter,
    delay: index * 0.05,
  }));

  const fetchReactionList = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/posts/${postId}/reactions`);
      setReactionList((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Lỗi khi tải danh sách cảm xúc:", err.message);
      setError("Không thể tải danh sách cảm xúc.");
      setTimeout(() => setError(""), 3000);
    }
  };

  useEffect(() => {
    if (location.state?.postId && location.state?.openComments) {
      const postId = parseInt(location.state.postId);
      if (postId) {
        fetchComments(postId);
        setSelectedCommentPostId(postId);
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const introTimer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    initBlinkText();
    initRippleEffect();
    const removeSparkleListener = sparkleMouseEffect();
    return () => {
      if (typeof removeSparkleListener === "function") removeSparkleListener();
    };
  }, []);

  useEffect(() => {
    const start = Date.now();
    setLoading(true);
    const params = userIDCMT ? { user_id: userIDCMT } : {};
    axios
      .get("http://localhost:8000/api/stories", { params })
      .then((res) => {
        const elapsed = Date.now() - start;
        const remainingTime = Math.max(2000 - elapsed, 0);
        setTimeout(() => {
          setStories(res.data);
          setLoading(false);
        }, remainingTime);
      })
      .catch((err) => {
        console.error("Lỗi khi tải stories:", err.message);
        setError("Không thể tải story.");
        setTimeout(() => setError(""), 3000);
        setLoading(false);
      });
  }, [userIDCMT]);

  useEffect(() => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để xem bài viết.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    fetchPosts(currentPage);
  }, [userIDCMT, currentPage]);

  useEffect(() => {
    console.log("Total posts:", totalPosts);
    console.log("Total pages:", totalPages);
  }, [totalPosts]);

  useEffect(() => {
    const handleFocus = () => {
      if (!userIDCMT) return;
      axios
        .get("http://localhost:8000/api/stories", { params: { user_id: userIDCMT } })
        .then((res) => setStories(res.data))
        .catch((err) => console.error("Lỗi khi làm mới stories:", err));
      axios
        .get("http://localhost:8000/api/posts", { params: { user_id: userIDCMT } })
        .then((res) => setPosts(res.data))
        .catch((err) => console.error("Lỗi khi làm mới posts:", err));
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [userIDCMT]);

  useEffect(() => {
    const updateNavButtons = () => {
      if (storyListRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = storyListRef.current;
        setShowNavButtons({
          left: scrollLeft > 0,
          right: scrollLeft < scrollWidth - clientWidth - 1,
        });
      }
    };
    const storyList = storyListRef.current;
    if (storyList) {
      storyList.addEventListener("scroll", updateNavButtons);
      updateNavButtons();
    }
    return () => {
      if (storyList) {
        storyList.removeEventListener("scroll", updateNavButtons);
      }
    };
  }, [stories]);

  useEffect(() => {
    const storyList = storyListRef.current;
    if (!storyList) return;

    let isDragging = false;
    let startX, scrollLeft;
    let animationFrameId;

    const startDragging = (e) => {
      isDragging = true;
      storyList.classList.add("dragging");
      startX = (e.pageX || e.touches[0].pageX) - storyList.offsetLeft;
      scrollLeft = storyList.scrollLeft;
    };

    const stopDragging = () => {
      isDragging = false;
      storyList.classList.remove("dragging");
      cancelAnimationFrame(animationFrameId);
    };

    const drag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = (e.pageX || e.touches[0].pageX) - storyList.offsetLeft;
      const walk = (x - startX) * 1.5;
      animationFrameId = requestAnimationFrame(() => {
        storyList.scrollLeft = scrollLeft - walk;
      });
    };

    storyList.addEventListener("mousedown", startDragging);
    storyList.addEventListener("touchstart", startDragging);
    storyList.addEventListener("mousemove", drag);
    storyList.addEventListener("touchmove", drag);
    storyList.addEventListener("mouseup", stopDragging);
    storyList.addEventListener("mouseleave", stopDragging);
    storyList.addEventListener("touchend", stopDragging);

    return () => {
      storyList.removeEventListener("mousedown", startDragging);
      storyList.removeEventListener("touchstart", startDragging);
      storyList.removeEventListener("mousemove", drag);
      storyList.removeEventListener("touchmove", drag);
      storyList.removeEventListener("mouseup", stopDragging);
      storyList.removeEventListener("mouseleave", stopDragging);
      storyList.removeEventListener("touchend", stopDragging);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const scrollStories = (direction) => {
    if (storyListRef.current) {
      const storyItemWidth = storyListRef.current.querySelector(".story-item")?.offsetWidth || 120;
      const scrollAmount = direction === "left" ? -storyItemWidth * 3 : storyItemWidth * 3;
      storyListRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const handleEditClick = (index, currentContent, commentId) => {
    setEditingIndex(index);
    setEditContent(currentContent);
    setOpenMenuIndex(null);
    setSelectedCommentId(commentId);
  };

  const handleSaveEdit = async () => {
    if (editingIndex === null || selectedCommentPostId === null || selectedCommentId === null) return;
    try {
      const response = await axios.put(
        `http://localhost:8000/api/posts/${selectedCommentPostId}/comments/${selectedCommentId}`,
        { content: editContent, user_id: userIDCMT }
      );
      const updatedComment = response.data;
      setComments((prevComments) => {
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
      setEditContent("");
      setSelectedCommentId(null);
    } catch (err) {
      console.error("Lỗi khi sửa bình luận:", err.message);
      setError("Không thể sửa bình luận.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await axios.delete(
        `http://localhost:8000/api/posts/${selectedCommentPostId}/comments/${commentId}`,
        { data: { user_id: userIDCMT } }
      );
      setComments((prev) => {
        const updated = { ...prev };
        if (updated[selectedCommentPostId]) {
          updated[selectedCommentPostId] = updated[selectedCommentPostId].filter(
            (comment) => comment.id !== commentId
          );
        }
        return updated;
      });
      setOpenMenuIndex(null);
    } catch (err) {
      console.error("Lỗi khi xóa bình luận:", err.message);
      setError("Không thể xóa bình luận.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const toggleExpandImages = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleEdit = async (post) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/posts/${post.id}`);
      const latestPost = response.data;
      if (!latestPost) {
        alert("Bài viết không còn tồn tại hoặc đã bị xóa. Hãy load lại trang!");
        return;
      }
      navigate(`/edit-post/${post.id}`, {
        state: { content: latestPost.content, imageUrl: latestPost.imageurl, videoUrl: latestPost.videourl },
      });
    } catch (error) {
      console.error("Không thể sửa bài viết:", error);
      alert("Bài viết không còn tồn tại hoặc đã bị xóa. Hãy load lại trang!");
    }
  };

  const handleEditStory = (story) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để sửa story.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    navigate(`/edit-story/${story.id}`, {
      state: {
        id: story.id,
        content: story.content,
        imageurl: story.imageurl,
        videourl: story.videourl,
        visibility: story.visibility || "public",
      },
    });
  };

  const handleDeleteStory = async (id) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để xóa story.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!window.confirm("Bạn có chắc muốn xóa story này?")) return;
    setDeletingStoryId(id);
    setShowTrash(true);
    try {
      const response = await axios.delete(`http://localhost:8000/api/stories/${id}`, {
        data: { user_id: userIDCMT },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStories(stories.filter((story) => story.id !== id));
      setSuccessMessage(response.data.message || "Story đã được xóa thành công");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Lỗi khi xóa story:", err.response?.data || err.message);
      const errorMessage =
        err.response?.status === 404
          ? "Story không tồn tại hoặc đã bị xóa"
          : err.response?.status === 403
            ? "Bạn không có quyền xóa story này"
            : err.response?.status === 401
              ? "Vui lòng đăng nhập lại"
              : "Không thể xóa story. Vui lòng thử lại.";
      setError(errorMessage);
      setTimeout(() => setError(""), 3000);
    } finally {
      setTimeout(() => {
        setShowTrash(false);
        setDeletingStoryId(null);
      }, 1000);
    }
  };

  const handleDeletePost = (postId) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để xóa bài viết.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      postElement.classList.add("sliced");
      postElement.addEventListener(
        "animationend",
        async () => {
          setLoading(true);
          try {
            await axios.delete(`http://localhost:8000/api/posts/${postId}`, {
              data: { user_id: userIDCMT },
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            setSuccessMessage("Bài viết đã được xóa thành công");
            setTimeout(() => setSuccessMessage(""), 3000);
          } catch (err) {
            console.error("Lỗi khi xóa bài viết:", err.response?.data || err.message);
            const errorMessage =
              err.response?.status === 404
                ? "Bài viết không tồn tại hoặc đã bị xóa"
                : err.response?.status === 403
                  ? "Bạn không có quyền xóa bài viết này"
                  : err.response?.status === 401
                    ? "Vui lòng đăng nhập lại"
                    : "Không thể xóa bài viết. Vui lòng thử lại.";
            setError(errorMessage);
            setTimeout(() => setError(""), 3000);
          } finally {
            setLoading(false);
          }
        },
        { once: true }
      );
    }
  };

  const handleToggleMenu = (storyId) => {
    setShowMenu(showMenu === storyId ? null : storyId);
  };

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  };

  const handleCommentSubmit = async (postId) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để bình luận.");
      return;
    }
    const content = commentInputs[postId];
    if (!content) return;
    try {
      const res = await fetch(`http://localhost:8000/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userIDCMT, content }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }
      await fetchComments(postId);
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (error) {
      console.error("Error submitting comment:", error);
      setError("Không thể gửi bình luận.");
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/posts/${postId}/comments`);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Lỗi khi tải bình luận:", err.message);
      setError("Không thể tải bình luận.");
      setTimeout(() => setError(""), 3000);
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
        activeMenuPostId &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setActiveMenuPostId(null);
      }
      if (
        showReactionList &&
        reactionListRef.current &&
        !reactionListRef.current.contains(event.target)
      ) {
        setShowReactionList(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuPostId, showReactionList]);

  const renderReaction = (type) => {
    const icons = { like: "👍", love: "❤️", haha: "😂", wow: "😲", sad: "😢", angry: "😡" };
    return icons[type] || "👍";
  };

  const renderButtonLabel = (userReaction) => {
    if (!userReaction) return "👍 Like";
    const labels = {
      like: "👍 Like",
      love: "❤️ Love",
      haha: "😂 Haha",
      wow: "😲 Wow",
      sad: "😢 Sad",
      angry: "😡 Angry",
    };
    return labels[userReaction.type] || "👍 Like";
  };

  const handleReactionClick = async (postId, reactionType = null) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để thả cảm xúc.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    const post = posts.find((p) => p.id === postId);
    const userReaction = post?.user_reaction;
    let newPosts = [...posts];
    let updatedPost = { ...post };

    try {
      if (userReaction && (reactionType === null || userReaction.type === reactionType)) {
        updatedPost = {
          ...updatedPost,
          user_reaction: null,
          reaction_summary: {
            ...updatedPost.reaction_summary,
            [userReaction.type]: (updatedPost.reaction_summary[userReaction.type] || 1) - 1,
          },
        };
        newPosts = newPosts.map((p) => (p.id === postId ? updatedPost : p));
        setPosts(newPosts);
        await axios.delete(`http://localhost:8000/api/posts/${postId}/react`, {
          data: { user_id: userIDCMT },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        const newReactionType = reactionType || "like";
        updatedPost = {
          ...updatedPost,
          user_reaction: { user_id: userIDCMT, post_id: postId, type: newReactionType },
          reaction_summary: {
            ...updatedPost.reaction_summary,
            [userReaction?.type]: userReaction
              ? (updatedPost.reaction_summary[userReaction.type] || 1) - 1
              : updatedPost.reaction_summary[userReaction?.type] || 0,
            [newReactionType]: (updatedPost.reaction_summary[newReactionType] || 0) + 1,
          },
        };
        newPosts = newPosts.map((p) => (p.id === postId ? updatedPost : p));
        setPosts(newPosts);
        await axios.post(
          `http://localhost:8000/api/posts/${postId}/react`,
          { user_id: userIDCMT, type: newReactionType },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      }
      setShowReactions(null);
    } catch (err) {
      console.error("Lỗi khi xử lý cảm xúc:", err.message);
      setError("Không thể xử lý cảm xúc.");
      setTimeout(() => setError(""), 3000);
      setPosts([...posts]);
    }
  };

  const getTotalReactions = (summary) => {
    return Object.values(summary || {}).reduce((sum, count) => sum + count, 0);
  };

  const handleOpenViewer = (userId) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để xem story.");
      setTimeout(() => setError(""), 3000);
      navigate("/login");
      return;
    }
    setSelectedUserId(userId);
    setIsViewerOpen(true);
  };

  const getLatestStories = () => {
    const userStories = {};
    stories.forEach((story) => {
      const userId = story.user?.id;
      if (
        !userStories[userId] ||
        new Date(story.created_at) > new Date(userStories[userId].created_at)
      ) {
        userStories[userId] = story;
      }
    });
    return Object.values(userStories);
  };

  const getUserStories = (userId) => {
    return stories
      .filter((story) => story.user?.id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const handleNextUser = () => {
    const currentIndex = filteredStories.findIndex(
      (story) => story.user.id === selectedUserId
    );
    if (currentIndex < filteredStories.length - 1) {
      setSelectedUserId(filteredStories[currentIndex + 1].user.id);
    } else {
      setIsViewerOpen(false);
      setSelectedUserId(null);
    }
  };

  const handlePrevUser = () => {
    const currentIndex = filteredStories.findIndex(
      (story) => story.user.id === selectedUserId
    );
    if (currentIndex > 0) {
      setSelectedUserId(filteredStories[currentIndex - 1].user.id);
    } else {
      setIsViewerOpen(false);
      setSelectedUserId(null);
    }
  };

  const filteredStories = getLatestStories();

  return (
    <div className="container">
      {showIntro && (
        <div className="home-intro-overlay">
          <div className="home-intro-text">
            {introText.map(({ letter, delay }, index) => (
              <span
                key={index}
                className="home-intro-letter"
                style={{ animationDelay: `${delay}s`, "--index": index }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      )}
      <Header />
      <Sidebar />
      <div className="main">
        <div className="story-containers">
          <h3 className="story-header blink-text">Bảng tin</h3>
          {loading && <p className="loading">⏳ Đang tải...</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !userIDCMT && (
            <p className="no-stories">Vui lòng đăng nhập để xem tin.</p>
          )}
          <div className="story-list-container">
            {showNavButtons.left && (
              <button
                className="story-nav-btn story-nav-prev"
                onClick={() => scrollStories("left")}
              >
                ❮
              </button>
            )}
            {showNavButtons.right && (
              <button
                className="story-nav-btn story-nav-next"
                onClick={() => scrollStories("right")}
              >
                ❯
              </button>
            )}
            <div className="story-list" ref={storyListRef}>
              {userIDCMT && (
                <div className="story-item create-story" onClick={() => navigate("/story")}>
                  <div className="story-user-info">
                    <img
                      src={
                        user?.profilepicture
                          ? `http://localhost:8000/storage/images/${user.profilepicture}`
                          : "/default-avatar.png"
                      }
                      alt="Avatar"
                      className="story-avatarst"
                    />
                    <div className="story-user-details">
                      <span className="story-username">Tạo tin ➕</span>
                    </div>
                  </div>
                </div>
              )}
              {filteredStories.map((story) => (
                <div
                  key={story.user.id}
                  className={`story-item ${deletingStoryId === story.id ? "deleting" : ""}`}
                  onClick={() => handleOpenViewer(story.user.id)}
                >
                  <div className="story-user-info">
                    <img
                      src={
                        story.user?.profilepicture
                          ? `http://localhost:8000/storage/images/${story.user.profilepicture}`
                          : "/default-avatar.png"
                      }
                      alt="Avatar"
                      className="story-avatars"
                    />
                    <div className="story-user-details">
                      <span className="story-username">{story.user?.username || "Người dùng"}</span>
                      <span className="story-time">{formatTime(story.created_at)}</span>
                    </div>
                  </div>
                  {userIDCMT && story.user?.id === userIDCMT && (
                    <>
                      <button
                        className="story-menus-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMenu(story.id);
                        }}
                      >
                        ⋮
                      </button>
                      {showMenu === story.id && (
                        <div className="story-menu" ref={menuRef}>
                          <button
                            className="story-menu-item"
                            onClick={() => handleEditStory(story)}
                          >
                            📝 Sửa
                          </button>
                          <button
                            className="story-menu-item"
                            onClick={() => handleDeleteStory(story.id)}
                          >
                            🗑️ Xóa Story
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  <div className="story-image-wrapper" style={{ background: !story.imageurl && !story.videourl ? 'linear-gradient(135deg, #1e3c72, #2a5298)' : 'none' }}>
                    {story.videourl?.match(/\.(mp4|webm)$/i) ? (
                      <video
                        src={`http://localhost:8000/storage/story_videos/${story.videourl}`}
                        className="story-image"
                        muted
                      />
                    ) : story.imageurl ? (
                      <img
                        src={`http://localhost:8000/storage/story_images/${story.imageurl}`}
                        alt="Story"
                        className="story-image"
                        onError={(e) => { e.target.src = '/default-story.jpg'; }}
                      />
                    ) : (
                      <img
                        src="/default-story.jpg"
                        alt="Default Story"
                        className="story-image"
                      />
                    )}
                  </div>
                  <div className="story-content">
                    <p className="text">{story.content}</p>
                  </div>
                </div>
              ))}
            </div>
            {showTrash && (
              <div className="trash-container">
                <div className="trash-bin">🗑️</div>
              </div>
            )}
          </div>
          {isViewerOpen && selectedUserId && (
            <StoryViewer
              stories={getUserStories(selectedUserId)}
              onClose={() => {
                setIsViewerOpen(false);
                setSelectedUserId(null);
              }}
              initialIndex={0}
              onNextUser={handleNextUser}
              onPrevUser={handlePrevUser}
              onDeleteStory={handleDeleteStory}
              currentUserId={userIDCMT}
            />
          )}
        </div>
        {loading ? (
          <div className="neon-loader-home">
            <div className="circle-loader-home"></div>
            <div className="bar-loader-home">
              <div className="progress-home"></div>
            </div>
            <p className="text-loading-home">LOADING ...</p>
          </div>
        ) : (
          <>
            {error && <p className="error">{error}</p>}
            {Array.isArray(posts) && posts.length > 0 ? (
              <>
                {posts.map((post) => (
                  <div className="post" id={`post-${post.id}`} key={post.id}>
                    <div className="slice slice1"></div>
                    <div className="slice slice2"></div>
                    <div className="slice slice3"></div>
                    <div className="slice slice4"></div>
                    <div className="slice slice5"></div>
                    <div className="post-header">
                      <div
                        className="user-info"
                        onClick={() => navigate(`/users/${post.user?.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={
                            post.user?.profilepicture
                              ? `http://localhost:8000/storage/images/${post.user.profilepicture}`
                              : "/images/image-default.jpg"
                          }
                          alt="Avatar"
                          className="avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/image-default.jpg";
                          }}
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
                            setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)
                          }
                        >
                          ⋯
                        </button>
                        {activeMenuPostId === post.id && post.user?.id === user?.id && (
                          <div className="options-menu" ref={menuRef}>
                            <button onClick={() => handleEdit(post)}>Sửa</button>
                            <button onClick={() => handleDeletePost(post.id)}>Xóa</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="post-content">{post.content}</p>
                    <div className="post-media">
                      {Array.isArray(post.imageurl) && (
                        <>
                          {(expandedPosts[post.id] ? post.imageurl : post.imageurl.slice(0, 6)).map(
                            (img, index) => (
                              <div key={index} className="image-wrapper">
                                <div className="media-overlay-black"></div>
                                <div className="media-overlay-hover"></div>
                                <img
                                  src={`http://localhost:8000/storage/images/${img}`}
                                  alt={`Ảnh ${index + 1}`}
                                  className="media-image"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/images/image-default.jpg";
                                  }}
                                />
                                {index === 5 && post.imageurl.length > 6 && !expandedPosts[post.id] && (
                                  <div
                                    className="image-overlay"
                                    onClick={() => toggleExpandImages(post.id)}
                                  >
                                    +{post.imageurl.length - 6} ảnh
                                  </div>
                                )}
                              </div>
                            )
                          )}
                          {expandedPosts[post.id] && (
                            <button
                              onClick={() => toggleExpandImages(post.id)}
                              className="collapse-btn"
                            >
                              Thu gọn
                            </button>
                          )}
                        </>
                      )}
                      {post.videourl && (
                        <div className="video-wrapper">
                          <div className="media-overlay-hover"></div>
                          <video controls className="media-video">
                            <source
                              src={`http://localhost:8000/storage/videos/${post.videourl}`}
                              type="video/mp4"
                            />
                            Trình duyệt không hỗ trợ video.
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
                            {Object.keys(post.reaction_summary).map(
                              (type) =>
                                post.reaction_summary[type] > 0 && (
                                  <span key={type}>{renderReaction(type)}</span>
                                )
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
                                <span>{getTotalReactions(post.reaction_summary)} lượt thả cảm xúc</span>
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
                                        {renderReaction(type)} {post.reaction_summary[type]}
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
                                      <span>{reaction.user?.username || reaction.username}</span>:{" "}
                                      {renderReaction(reaction.type)}
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
                          className={`like-button ${post.user_reaction ? "reacted" : ""}`}
                          onClick={() => handleReactionClick(post.id)}
                        >
                          {renderButtonLabel(post.user_reaction)}
                        </button>
                        {showReactions === post.id && (
                          <div className="reaction-icons">
                            {["like", "love", "haha", "wow", "sad", "angry"].map((type) => (
                              <button
                                key={type}
                                className={`reaction-button ${post.user_reaction?.type === type ? "selected" : ""}`}
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
                            setSelectedCommentPostId(null);
                          } else {
                            fetchComments(post.id);
                            setSelectedCommentPostId(post.id);
                          }
                        }}
                      >
                        💬 Bình luận
                      </button>
                      <button onClick={() => alert("Chức năng chia sẻ chưa được triển khai")}>
                        🔗 Chia sẻ
                      </button>
                    </div>
                    {selectedCommentPostId === post.id && (
                      <>
                        <div className="cm-add-comment">
                          <input
                            type="text"
                            placeholder="Viết bình luận..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) =>
                              setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                            }
                          />
                          <button onClick={() => handleCommentSubmit(post.id)}>Gửi</button>
                        </div>
                        <div className="cm-comments">
                          {comments[post.id]?.map((comment, index) => (
                            <div key={index} className="cm-comment">
                              <div className="cm-comment-content">
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
                              </div>
                              {comment.user?.id === userIDCMT && (
                                <div className="cm-comment-actions">
                                  <button className="cm-btn-more" onClick={() => toggleMenu(index)}>
                                    ...
                                  </button>
                                  <div
                                    className="cm-comment-menu"
                                    style={{ display: openMenuIndex === index ? "block" : "none" }}
                                  >
                                    <button
                                      onClick={() => handleEditClick(index, comment.content, comment.id)}
                                    >
                                      Sửa
                                    </button>
                                    <button onClick={() => handleDelete(comment.id)}>Xóa</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div
                  className="pagination"
                  style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 16 }}
                >
                  <button disabled={currentPage === 1 || loading} onClick={() => fetchPosts(currentPage - 1)}>
                    ◀ Trang trước
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => fetchPosts(page)}
                        disabled={page === currentPage || loading}
                        style={{
                          fontWeight: page === currentPage ? "bold" : "normal",
                          backgroundColor: page === currentPage ? "#007bff" : "#f0f0f0",
                          color: page === currentPage ? "white" : "black",
                          padding: "4px 10px",
                          borderRadius: 4,
                          border: "1px solid #ccc",
                        }}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    disabled={currentPage === totalPages || loading}
                    onClick={() => fetchPosts(currentPage + 1)}
                  >
                    Trang sau ▶
                  </button>
                </div>
              </>
            ) : (
              <p>Không có bài viết nào để hiển thị.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}