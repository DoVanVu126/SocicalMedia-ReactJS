import React, { useState, useEffect, useRef } from "react";
import "../style/StoryViewer.css";

const StoryViewer = ({
  stories,
  onClose,
  initialIndex = 0,
  onNextUser,
  onPrevUser,
  onDeleteStory,
  currentUserId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(null);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const currentStory = stories[currentIndex];

  useEffect(() => {
    let duration = 5000;
    let startTime = Date.now();

    if (currentStory?.videourl) {
      const video = videoRef.current;
      if (video) {
        video.play().catch((error) => {
          console.error("Video play error:", error);
          goToNext();
        });
        video.onloadedmetadata = () => {
          duration = video.duration * 1000;
          startProgress(duration, startTime);
        };
        video.onerror = () => {
          console.error("Video load error:", currentStory.videourl);
          goToNext();
        };
      }
    } else {
      startProgress(duration, startTime);
    }

    function startProgress(duration, start) {
      const updateProgress = () => {
        const elapsed = Date.now() - start;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);

        if (newProgress < 100) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
          goToNext();
        }
      };
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [currentIndex, currentStory]);

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setDirection("right");
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else if (onNextUser) {
      onNextUser(); // Chuyển sang user tiếp theo khi hết story
    } else {
      onClose();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setDirection("left");
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    } else if (onPrevUser) {
      onPrevUser(); // Chuyển sang user trước đó khi ở story đầu tiên
    }
  };

  const handleProgressStyle = (index) => {
    if (index < currentIndex) {
      return { width: "100%" };
    }
    if (index === currentIndex) {
      return { width: `${progress}%` };
    }
    return { width: "0%" };
  };

  const handleContainerClick = (e) => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;

    if (clickX < halfWidth) {
      goToPrevious();
    } else {
      goToNext();
    }
  };

  const handleDelete = () => {
    if (onDeleteStory && currentStory) {
      onDeleteStory(currentStory.id);
      if (stories.length === 1) {
        onClose(); // Đóng nếu chỉ còn 1 story
      } else {
        goToNext(); // Chuyển sang story tiếp theo
      }
    }
  };

  if (!currentStory) return null;

  return (
    <div className="story-viewer-overlay" onClick={onClose}>
      <div className="story-viewer" ref={containerRef}>
        <div className="progress-bar-container">
          {stories.map((_, index) => (
            <div
              key={index}
              className={`progress-segment ${
                index < currentIndex
                  ? "completed"
                  : index === currentIndex
                  ? "active"
                  : ""
              }`}
              style={handleProgressStyle(index)}
            ></div>
          ))}
        </div>

        <div
          className={`story-content-display ${direction ? `slide-${direction}` : ""}`}
          onClick={handleContainerClick}
        >
          <div className="story-user-info">
            <img
              src={
                currentStory.user?.profilepicture
                  ? `http://localhost:8000/storage/images/${currentStory.user.profilepicture}`
                  : "/default-avatar.png"
              }
              alt="Avatar"
              className="story-avatar"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
                console.error("Avatar load error:", currentStory.user?.profilepicture);
              }}
            />
            <div className="story-user-details">
              <span className="story-username">
                {currentStory.user?.username || "Người dùng"}
              </span>
              <span className="story-time">
                {new Date(currentStory.created_at).toLocaleString("vi-VN", {
                  timeStyle: "short",
                  dateStyle: "short",
                })}
              </span>
            </div>
          </div>
          {currentStory.videourl?.match(/\.(mp4|webm)$/i) ? (
            <video
              ref={videoRef}
              src={`http://localhost:8000/storage/story_videos/${currentStory.videourl}`}
              className="story-media"
              autoPlay
              muted
              playsInline
              onError={(e) => {
                console.error("Video load error:", currentStory.videourl);
                goToNext();
              }}
            />
          ) : (
            <img
              src={`http://localhost:8000/storage/story_images/${currentStory.imageurl}`}
              className="story-media"
              alt="Story"
              onError={(e) => {
                e.target.src = "/default-image.png";
                console.error("Image load error:", currentStory.imageurl);
              }}
            />
          )}
          <div className="story-text">{currentStory.content}</div>
          {currentStory.user?.id === currentUserId && (
            <div className="story-menu-wrapper">
              <button
                className="story-menu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // Logic hiển thị menu có thể mở rộng, hiện tại chỉ gọi delete
                  handleDelete();
                }}
              >
                ⋮
              </button>
            </div>
          )}
        </div>

        <button
          className="close-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default StoryViewer;