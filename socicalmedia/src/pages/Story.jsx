import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../style/AddStory.css";
import {
  initBubbleEffect,
  sparkleMouseEffect,
  initTypewriterPlaceholder,
  initGradientTextHover,
  initButtonRipple,
  initHeaderPulse,
  initStoryParallax,
  initRainbowSmokeEffect,
} from '../script';

// StoryIntro component for the animated intro
const StoryIntro = ({ onComplete }) => {
  const title = "Add Story";
  const letters = title.split('');

  return (
    <div className="story-intro-container">
      <div className="story-intro-text">
        {letters.map((letter, index) => (
          <span
            key={index}
            className="story-intro-letter"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </div>
    </div>
  );
};

const Story = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    content: "",
    visibility: "public",
    image: null,
    video: null,
  });
  const [showMenu, setShowMenu] = useState(null);
  const [showNavButtons, setShowNavButtons] = useState({ left: false, right: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMergeEffect, setShowMergeEffect] = useState(false);
  const [animateImage, setAnimateImage] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const storyListRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userIDCMT = user?.id;
  const navigate = useNavigate();

  // Hide intro after 1.8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1800); // 800ms for animation + 1000ms display
    return () => clearTimeout(timer);
  }, []);

  const triggerSparkleEffect = () => {
    const createSparkle = () => {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle-star';
      sparkle.style.left = `${Math.random() * 100}vw`;
      sparkle.style.top = `${Math.random() * 100}vh`;
      const colors = ['#ffffff', '#ffeb3b', '#ff6b6b', '#4dd0e1', '#b388ff'];
      sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
      document.body.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1000);
    };

    const sparkleCount = 20;
    for (let i = 0; i < sparkleCount; i++) {
      setTimeout(createSparkle, i * 50);
    }
  };

  useEffect(() => {
    triggerSparkleEffect();

    return () => {
      document.querySelectorAll('.sparkle-star').forEach((sparkle) => sparkle.remove());
    };
  }, []);

  useEffect(() => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để xem story");
      return;
    }
    setLoading(true);
    axios
      .get("http://localhost:8000/api/stories", { params: { user_id: userIDCMT } })
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

    const startDragging = (e) => {
      isDragging = true;
      storyList.classList.add("dragging");
      startX = (e.pageX || e.touches[0].pageX) - storyList.offsetLeft;
      scrollLeft = storyList.scrollLeft;
    };

    const stopDragging = () => {
      isDragging = false;
      storyList.classList.remove("dragging");
    };

    const drag = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = (e.pageX || e.touches[0].pageX) - storyList.offsetLeft;
      const walk = (x - startX) * 2;
      storyList.scrollLeft = scrollLeft - walk;
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
    };
  }, []);

  useEffect(() => {
    const removeBubbleListener = initBubbleEffect();
    const removeSparkleListener = sparkleMouseEffect();
    const removeSmokeListener = initRainbowSmokeEffect();
    initTypewriterPlaceholder();
    initGradientTextHover();
    initButtonRipple();
    initStoryParallax();
    initHeaderPulse();
    return () => {
      if (typeof removeBubbleListener === "function") removeBubbleListener();
      if (typeof removeSparkleListener === "function") removeSparkleListener();
      if (typeof removeSmokeListener === "function") removeSmokeListener();
    };
  }, []);

  const scrollStories = (direction) => {
    if (storyListRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      storyListRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setFormData({
        ...formData,
        [name]: files[0],
      });
      if (name === "image") {
        setAnimateImage(true);
        setTimeout(() => setAnimateImage(false), 1000);
      }
    }
  };

  const handleAddStory = async (e) => {
    e.preventDefault();
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để thêm story");
      return;
    }
    setIsSubmitting(true);
    setTimeout(async () => {
      const formDataObj = new FormData();
      formDataObj.append("user_id", userIDCMT);
      formDataObj.append("content", formData.content);
      formDataObj.append("visibility", formData.visibility);
      if (formData.image) formDataObj.append("image", formData.image);
      if (formData.video) formDataObj.append("video", formData.video);

      try {
        const res = await axios.post("http://localhost:8000/api/stories", formDataObj);
        setShowMergeEffect(true);
        triggerSparkleEffect();
        setTimeout(() => {
          const updatedStories = [res.data.story, ...stories];
          setStories(updatedStories);
          setFormData({
            content: "",
            visibility: "public",
            image: null,
            video: null,
          });
          setError(null);
          setIsSubmitting(false);
          setShowMergeEffect(false);
          navigate("/home");
        }, 1000);
      } catch (err) {
        console.error("Lỗi khi thêm story:", err);
        setError("Không thể thêm story");
        setIsSubmitting(false);
      }
    }, 800);
  };

  const handleEditStory = (story) => {
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để sửa story");
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
      setError("Vui lòng đăng nhập để xóa story");
      return;
    }
    axios
      .delete(`http://localhost:8000/api/stories/${id}`, {
        data: { user_id: userIDCMT },
      })
      .then(() => {
        setStories(stories.filter((story) => story.id !== id));
        setError(null);
      })
      .catch((err) => {
        console.error("Lỗi khi xóa story:", err);
        setError("Không thể xóa story");
      });
  };

  const handleToggleMenu = (id) => {
    setShowMenu(showMenu === id ? null : id);
  };

  if (loading)
    return (
      <>
        <div className="youtube-loader"></div>
        <div className="spinner"></div>
      </>
    );

  if (showIntro) {
    return <StoryIntro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <div className="story-container">
      <Header />
      <Sidebar />
      <div className="scrollable-story-wrapper">
        {error && <p className="error">{error}</p>}
        {showNavButtons.left && (
          <button className="story-scroll-btn prev" onClick={() => scrollStories("left")}>
            ❮
          </button>
        )}
        {showNavButtons.right && (
          <button className="story-scroll-btn next" onClick={() => scrollStories("right")}>
            ❯
          </button>
        )}
        <div className="horizontal-story-list" ref={storyListRef}>
          {stories.filter((story) => story.user?.id === userIDCMT).map((story) => (
            <div key={story.id} className="story-item scrollable" data-speed="0.2">
              <div className="story-user-info">
                <img
                  src={
                    story.user?.profilepicture
                      ? `http://localhost:8000/storage/images/${story.user.profilepicture}`
                      : "/default-avatar.png"
                  }
                  alt="Avatar"
                  className="story-avatarh"
                />
                <div className="story-user-details">
                  <span className="story-username">{story.user?.username || "Người dùng"}</span>
                  <span className="story-time">{new Date(story.created_at).toLocaleString()}</span>
                </div>
              </div>
              <button
                className="story-menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleMenu(story.id);
                }}
              >
                ⋮
              </button>
              {showMenu === story.id && story.user?.id === userIDCMT && (
                <div className="story-menu">
                  <button className="story-menu-item" onClick={() => handleEditStory(story)}>
                    📝 Sửa
                  </button>
                  <button className="story-menu-item" onClick={() => handleDeleteStory(story.id)}>
                    🗑️ Xóa
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
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleAddStory} className="add-story-form">
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Nội dung"
          className="storys-input"
          aria-required="true"
        />
        <div className="visibility-container">
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleInputChange}
            className="visibility-select"
          >
            <option value="public">Công khai</option>
            <option value="private">Riêng tư</option>
          </select>
        </div>
        <div className="file-inputs">
          <label className="file-label">
            {formData.image ? formData.image.name : "Chọn ảnh"}
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              className="file-input"
            />
          </label>
          <label className="file-label">
            {formData.video ? formData.video.name : "Chọn video"}
            <input
              type="file"
              name="video"
              onChange={handleFileChange}
              accept="video/*"
              className="file-input"
            />
          </label>
        </div>
        <div className="media-preview">
          {formData.image && (
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Preview"
              className={`preview-media ${isSubmitting ? 'gathering' : ''} ${animateImage ? 'fall-in' : ''}`}
            />
          )}
          {formData.video && (
            <video
              src={URL.createObjectURL(formData.video)}
              className={`preview-media ${isSubmitting ? 'gathering' : ''}`}
              muted
            />
          )}
        </div>
        {showMergeEffect && (
          <div className="merge-effect">
            <div className="merge-fragment fragment1"></div>
            <div className="merge-fragment fragment2"></div>
            <div className="merge-fragment fragment3"></div>
            <img
              src={formData.image ? URL.createObjectURL(formData.image) : '/default-image.png'}
              alt="Merged Story"
              className="merge-image"
            />
          </div>
        )}
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          Thêm Story
        </button>
      </form>
    </div>
  );
};

export default Story;