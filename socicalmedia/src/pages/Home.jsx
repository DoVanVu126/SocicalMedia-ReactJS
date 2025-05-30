import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../style/Home.css";
import "../style/Notification.css";
import "../style/HomeNotification.css";
import StoryViewer from "../components/StoryViewer";
import { initBlinkText, sparkleMouseEffect, initRippleEffect } from "../script";
import favouriteService from "../services/FavouriteService";
import savePostService from "../services/SavePostService";
import postService from "../services/PostService";

export default function Home() {
  const [loading, setLoading] = useState(true);
  // Loader 3 giây chỉ khi lần đầu load trang
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedCommentPostId, setSelectedCommentPostId] = useState(null);
  const [error, setError] = useState(null);
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
  const user = JSON.parse(localStorage.getItem("user"));
  const userIDCMT = user?.id;
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const reactionListRef = useRef(null);
  const storyListRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 10;

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

  // Hàm điều hướng phân trang
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const [showNavButtons, setShowNavButtons] = useState({
    left: false,
    right: false,
  });

  const navigate = useNavigate();

  // Split intro text into letters for animation
  const introText = "SocialMediaApp".split("").map((letter, index) => ({
    letter,
    delay: index * 0.05,
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    initBlinkText();
    initRippleEffect();
  }, []);

  useEffect(() => {
    const removeSparkleListener = sparkleMouseEffect();
    return () => {
      if (typeof removeSparkleListener === "function") removeSparkleListener();
    };
  }, []);

  useEffect(() => {
    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    const start = Date.now();
    setLoading(true);
    const params = userIDCMT ? { user_id: userIDCMT } : {};
    axios
        .get("http://localhost:8000/api/stories", { params })
        .then((res) => {
          const elapsed = Date.now() - start;
          const remainingTime = Math.max(3000 - elapsed, 0);
          setTimeout(() => {
            setStories(res.data);
            setLoading(false);
          }, remainingTime);
        })
        .catch((err) => {
          console.error("Error fetching stories:", err);
          setError("Không thể tải tin.");
          setLoading(false);
        });
  }, [userIDCMT]);

  useEffect(() => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để xem bài viết.");
      return;
    }

    fetchPosts(currentPage); // Gọi API phân trang đã đúng
  }, [userIDCMT, currentPage]);

  useEffect(() => {
    console.log("Total posts:", totalPosts);
    console.log("Total pages:", totalPages);
  }, [totalPosts]);

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
      const storyItemWidth =
          storyListRef.current.querySelector(".story-item")?.offsetWidth || 120;
      const scrollAmount =
          direction === "left" ? -storyItemWidth * 3 : storyItemWidth * 3;
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
    if (
        editingIndex === null ||
        selectedCommentPostId === null ||
        selectedCommentId === null
    ) {
      return;
    }

    try {
      const response = await axios.put(
          `http://localhost:8000/api/posts/${selectedCommentPostId}/comments/${selectedCommentId}`,
          {
            content: editContent,
            user_id: userIDCMT,
          }
      );

      // Cập nhật comment sau khi sửa
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

      // Reset các state
      setEditingIndex(null);
      setEditContent("");
      setSelectedCommentId(null);
    } catch (error) {
      console.error("Error editing comment:", error);
      setError("Không thể sửa bình luận.");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      return;
    }
    try {
      const response = await fetch(
          `http://localhost:8000/api/posts/${selectedCommentPostId}/comments/${commentId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userIDCMT }),
          }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error deleting comment:", errorData);
        setError("Unable to delete comment.");
        return;
      }
      setComments(prevComments => {

        const updatedComments = { ...prevComments };
        if (updatedComments[selectedCommentPostId]) {
          updatedComments[selectedCommentPostId] = updatedComments[
              selectedCommentPostId
              ].filter((comment) => comment.id !== commentId);
        }
        return updatedComments;
      });
      setOpenMenuIndex(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Không thể xóa bình luận.");
    }
  };

  const toggleExpandImages = (postId) => {
    setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };
  const handleEdit = async (post) => {
    try {
      // Gửi request GET để kiểm tra bài viết có tồn tại không
      const response = await axios.get(`http://localhost:8000/api/posts/${post.id}`);
      const latestPost = response.data;
      if (!latestPost) {
        alert("Bài viết không còn tồn tại hoặc đã bị xóa. Hãy load lại trang!");
        return;
      }
      // Nếu không thay đổi, điều hướng sang trang chỉnh sửa
      navigate(`/edit-post/${post.id}`, {
        state: {
          content: latestPost.content,
          imageUrl: latestPost.imageurl,
          videoUrl: latestPost.videourl,
        },
      });

    } catch (error) {
      console.error("Không thể sửa bài viết:", error);
      alert("Bài viết không còn tồn tại hoặc đã bị xóa. Hãy load lại trang!");
    }
  };

  const handleEditStory = (story) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để sửa tin.");
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

  const handleDeleteStory = (id) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để xóa tin.");
      return;
    }
    if (!window.confirm("Bạn có chắc muốn xóa tin này?")) {
      return;
    }
    setDeletingStoryId(id);
    setShowTrash(true);
    setTimeout(() => {
      axios
          .delete(`http://localhost:8000/api/stories/${id}`, {
            data: { user_id: userIDCMT },
          })
          .then(() => {
            setStories(stories.filter((story) => story.id !== id));
            setShowTrash(false);
            setDeletingStoryId(null);
          })
          .catch((err) => {
            console.error("Error deleting story:", err);
            setError("Không thể xóa tin.");
            setShowTrash(false);
            setDeletingStoryId(null);
          });
    }, 1000);
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
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để bình luận.");
      return;
    }
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
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Không thể tải bình luận.");
    }
  };

  const fetchReactionList = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/posts/${postId}/reactions`);
      setReactionList((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Error fetching reaction list:", err);
      setError("Không thể tải danh sách cảm xúc.");
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
      setError("Vui lòng đăng nhập để thực hiện hành động này.");
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
        });
      } else {
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
            [userReaction?.type]: userReaction
                ? (updatedPost.reaction_summary[userReaction.type] || 1) - 1
                : updatedPost.reaction_summary[userReaction?.type] || 0,
            [newReactionType]: (updatedPost.reaction_summary[newReactionType] || 0) + 1,
          },
        };
        newPosts = newPosts.map((p) => (p.id === postId ? updatedPost : p));
        setPosts(newPosts);
        await axios.post(`http://localhost:8000/api/posts/${postId}/react`, {
          user_id: userIDCMT,
          type: newReactionType,
        });
      }
      setShowReactions(null);
    } catch (err) {
      console.error("Error processing reaction:", err);
      setError("Không thể xử lý cảm xúc.");
      setPosts([...posts]);
    }
  };

  const getTotalReactions = (summary) => {
    return Object.values(summary || {}).reduce((sum, count) => sum + count, 0);
  };
  const handleOpenViewer = (userId) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để xem tin.");
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

  const filteredStories = getLatestStories();

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

  const addOrUpdateFavourite = async (id) => {
    const data = {
      user_id: user.id,
      post_id: id
    }
    await favouriteService.addUpdateFavourite(data)
        .then((res) => {
          if (res.status === 200) {
            console.log("data", res.data)
          } else {
            alert('Error')
          }
        })
        .catch((err) => {
          console.log(err)
        })
  }

  const addOrUpdateSave = async (id) => {
    const data = {
      user_id: user.id,
      post_id: id
    }
    await savePostService.addUpdateSave(data)
        .then((res) => {
          if (res.status === 200) {
            console.log("data", res.data)
          } else {
            alert('Error')
          }
        })
        .catch((err) => {
          console.log(err)
        })
  }

  const sharePost = async (id) => {
    setLoading(true);
    const data = {
      user_id: user.id,
      post_id: id
    }
    await postService.sharePost(data)
        .then((res) => {
          if (res.status === 200) {
            console.log("data", res.data)
            alert('Chia sẻ bài viết thành công!')
            setLoading(false)
          } else {
            alert('Error')
            setLoading(false)
          }
        })
        .catch((err) => {
          setLoading(false)
          console.log(err)
        })
  }

  return (
      <div className="container">
        {showIntro && (
            <div className="home-intro-overlay">
              <div className="home-intro-text">
                {introText.map(({ letter, delay }, index) => (
                    <span
                        key={index}
                        className="home-intro-letter"
                        style={{
                          animationDelay: `${delay}s`,
                          "--index": index,
                        }}
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
                    ›
                  </button>
              )}
              <div className="story-list" ref={storyListRef}>
                {userIDCMT && (
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
                        className={`story-item ${deletingStoryId === story.id ? 'deleting' : ''}`}
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
                      <span className="story-username">
                        {story.user?.username || "Người dùng"}
                      </span>
                          <span className="story-time">
                        {formatTime(story.created_at)}
                      </span>
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
                {Array.isArray(posts) &&
                    posts.length > 0 &&
                    posts.map((post) => (
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
                                    e.target.onerror = null; // tránh lỗi vòng lặp
                                    e.target.src = "/images/image-default.jpg"; // fallback ảnh mặc định
                                  }}
                              />

                              <div>
                                <strong>{post.user?.username || "Người dùng"}</strong>
                                <br />
                                <small>{new Date(post.created_at).toLocaleString()}</small>
                              </div>
                            </div>
                            <div className="post-options">
                              <div className="dropdown">
                                <a className="" href="#" role="button"
                                   data-bs-toggle="dropdown" aria-expanded="false">
                                  <i className="bi bi-three-dots"></i>
                                </a>

                                <ul className="dropdown-menu small">
                                  <li>
                                    <a className="dropdown-item" href="#"
                                       onClick={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)}>
                                      <i className="bi bi-pencil-square"></i> Hành động
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#"
                                       onClick={() => addOrUpdateSave(post.id)}>
                                      <i className="bi bi-bookmarks"></i> Lưu trữ
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#" onClick={() => addOrUpdateFavourite(post.id)}>
                                      <i className="bi bi-heart"></i> Yêu thích
                                    </a>
                                  </li>
                                  <li>
                                    <a className="dropdown-item" href="#"
                                       onClick={() => sharePost(post.id)}>
                                      <i className="bi bi-share"></i> Chia sẻ nhanh
                                    </a>
                                  </li>
                                </ul>
                              </div>

                              {activeMenuPostId === post.id && post.user?.id === user?.id && (
                                  <div className="options-menu" ref={menuRef}>
                                    <button onClick={() => handleEdit(post)}>Sửa</button>
                                    <div className="slice slice1"></div>
                                    <div className="slice slice2"></div>
                                    <div className="slice slice3"></div>
                                    <div className="slice slice4"></div>
                                    <div className="slice slice5"></div>

                                    <button
                                        onClick={() => {
                                          if (!window.confirm("Bạn có chắc muốn xóa bài viết này không?")) {
                                            return;
                                          }
                                          const postElement = document.getElementById(`post-${post.id}`);

                                          if (postElement) {
                                            postElement.classList.add("sliced");
                                            postElement.addEventListener(
                                                "animationend",
                                                () => {
                                                  setLoading(true);
                                                  axios
                                                      .delete(`http://localhost:8000/api/posts/${post.id}`, {
                                                        data: { user_id: userIDCMT },
                                                      })
                                                      .then(() => {
                                                        setPosts((prevPosts) =>
                                                            prevPosts.filter((p) => p.id !== post.id)
                                                        );
                                                      })
                                                      .catch((err) => {
                                                        console.error("Lỗi khi xóa bài viết:", err);
                                                        setError("Không thể xóa bài viết, hãy load lại trang !");
                                                      })
                                                      .finally(() => setLoading(false));
                                                },
                                                { once: true }
                                            );

                                          }
                                        }}
                                    >
                                      Xóa
                                    </button>
                                  </div>
                              )}
                            </div>
                          </div>
                          <p className="post-content">{post.content}</p>
                          <div key={post.id} className="post-media">
                            {Array.isArray(post.imageurl) && (
                                <>
                                  {(expandedPosts[post.id] ? post.imageurl : post.imageurl.slice(0, 6)).map((img, index) => (
                                      <div key={index} className="image-wrapper">
                                        <div className="media-overlay-black"></div>
                                        <div className="media-overlay-hover"></div>
                                        <img
                                            src={`http://localhost:8000/storage/images/${img}`}
                                            alt={`Ảnh ${index + 1}`}
                                            className="media-image"
                                            onError={(e) => {
                                              e.target.onerror = null; // tránh lỗi vòng lặp
                                              e.target.src = '/images/image-default.jpg'; // đường dẫn ảnh mặc định trong public folder
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
                                  ))}
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

                              <span>
                                {getTotalReactions(post.reaction_summary)} lượt thả cảm xúc
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
                                            className={`reaction-icon ${post.user_reaction?.type === type ? "selected" : ""
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
                                          setCommentInputs({
                                            ...commentInputs,
                                            [post.id]: e.target.value,
                                          })
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

                                        <div className="cm-comment-actions">
                                          {comment.user?.id === userIDCMT && (
                                              <>
                                                <button className="cm-btn-more" onClick={() => toggleMenu(index)}>
                                                  ...
                                                </button>
                                                <div
                                                    className="cm-comment-menu"
                                                    style={{ display: openMenuIndex === index ? "block" : "none" }}
                                                >
                                                  <button onClick={() => handleEditClick(index, comment.content, comment.id)}>Sửa</button>
                                                  <button onClick={() => handleDelete(comment.id)}>Xóa</button>
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
                    ))}
                <div className="pagination" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}>
                  <button
                      disabled={currentPage === 1 || loading}
                      onClick={() => fetchPosts(currentPage - 1)}
                  >
                    ◀ Trang trước
                  </button>

                  {/* Danh sách số trang */}
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
                              padding: '4px 10px',
                              borderRadius: 4,
                              border: '1px solid #ccc',
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
          )}
        </div>
      </div>
  );
}