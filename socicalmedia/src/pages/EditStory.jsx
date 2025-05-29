import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../style/EditStory.css";

import {
  initGradientTextHover,
  sparkleMouseEffect,
  initRainbowSmokeEffect,
} from "../script";

const EditStory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const userIDCMT = user?.id;

  const story = location.state || {
    id: null,
    content: "",
    imageurl: null,
    videourl: null,
    visibility: "public",
  };

  const [formData, setFormData] = useState({
    content: story.content || "",
    visibility: story.visibility || "public",
    image: null,
    video: null,
  });

  const [preview, setPreview] = useState({
    type: story.videourl ? "video" : story.imageurl ? "image" : null,
    url: story.videourl
      ? `http://localhost:8000/storage/story_videos/${story.videourl}`
      : story.imageurl
      ? `http://localhost:8000/storage/story_images/${story.imageurl}`
      : null,
  });

  const [error, setError] = useState(null);
  const currentPreviewUrl = useRef(null);
  const imageRef = useRef(null); // Ref cho ảnh preview
  const previewContainerRef = useRef(null); // Ref cho container của preview

  useEffect(() => {
    if (!userIDCMT || !story.id) {
      setError("Vui lòng đăng nhập hoặc chọn story để chỉnh sửa");
      navigate("/home");
    }
  }, [userIDCMT, story.id, navigate]);

  useEffect(() => {
    initGradientTextHover();
    const removeSparkleListener = sparkleMouseEffect();
    const removeSmokeListener = initRainbowSmokeEffect();

    return () => {
      if (typeof removeSparkleListener === "function") {
        removeSparkleListener();
      }
      if (typeof removeSmokeListener === "function") {
        removeSmokeListener();
      }
    };
  }, []);

  useEffect(() => {
    if (currentPreviewUrl.current) {
      URL.revokeObjectURL(currentPreviewUrl.current);
      currentPreviewUrl.current = null;
    }

    if (formData.image) {
      const url = URL.createObjectURL(formData.image);
      // Nếu có ảnh cũ, chạy hiệu ứng phân tách trước khi cập nhật ảnh mới
      if (preview.url && preview.type === "image" && imageRef.current) {
        disintegrateImage(() => {
          setPreview({ type: "image", url });
          currentPreviewUrl.current = url;
        });
      } else {
        setPreview({ type: "image", url });
        currentPreviewUrl.current = url;
      }
    } else if (formData.video) {
      const url = URL.createObjectURL(formData.video);
      setPreview({ type: "video", url });
      currentPreviewUrl.current = url;
    } else {
      setPreview({
        type: story.videourl ? "video" : story.imageurl ? "image" : null,
        url: story.videourl
          ? `http://localhost:8000/storage/story_videos/${story.videourl}`
          : story.imageurl
          ? `http://localhost:8000/storage/story_images/${story.imageurl}`
          : null,
      });
    }

    return () => {
      if (currentPreviewUrl.current) {
        URL.revokeObjectURL(currentPreviewUrl.current);
      }
    };
  }, [formData.image, formData.video, story.imageurl, story.videourl]);

  // Hàm tạo hiệu ứng phân tách
  const disintegrateImage = (callback) => {
    const img = imageRef.current;
    const container = previewContainerRef.current;
    if (!img || !container) return callback();

    const rect = img.getBoundingClientRect();
    const particleCount = 50; // Số lượng particle
    const particles = [];

    // Tạo các particle
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "disintegrate-particle";
      particle.style.width = "8px";
      particle.style.height = "8px";
      particle.style.background = `url(${img.src})`;
      particle.style.backgroundSize = `${rect.width}px ${rect.height}px`;
      particle.style.backgroundPosition = `${-Math.random() * rect.width}px ${
        -Math.random() * rect.height
      }px`;
      particle.style.position = "absolute";
      particle.style.left = `${Math.random() * rect.width}px`;
      particle.style.top = `${Math.random() * rect.height}px`;
      particle.style.opacity = "1";
      container.appendChild(particle);
      particles.push(particle);
    }

    // Ẩn ảnh gốc
    img.style.opacity = "0";

    // Áp dụng hiệu ứng phân tách
    particles.forEach((particle, index) => {
      particle.style.animation = `disintegrate 0.8s ease forwards ${
        index * 0.02
      }s`;
    });

    // Xóa particles và gọi callback sau khi hoàn thành
    setTimeout(() => {
      particles.forEach((particle) => particle.remove());
      img.style.opacity = "1"; // Khôi phục opacity cho ảnh mới
      callback();
    }, 1000); // Đợi hiệu ứng hoàn tất
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      image: name === "image" ? files[0] : null,
      video: name === "video" ? files[0] : null,
    }));
  };

  const clearFile = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  const handleUpdateStory = async (e) => {
    e.preventDefault();
    if (!userIDCMT) {
      setError("Vui lòng đăng nhập để chỉnh sửa story");
      return;
    }

    const data = new FormData();
    data.append("user_id", userIDCMT);
    data.append("content", formData.content);
    data.append("visibility", formData.visibility);
    if (formData.image) data.append("image", formData.image);
    if (formData.video) data.append("video", formData.video);

    try {
      await axios.post(
        `http://localhost:8000/api/stories/${story.id}?_method=PUT`,
        data
      );
      setFormData({ content: "", visibility: "public", image: null, video: null });
      setPreview({ type: null, url: null });
      navigate("/home");
    } catch (err) {
      console.error("Lỗi khi sửa story:", err);
      setError("Không thể cập nhật story. Vui lòng thử lại.");
    }
  };

  const handleCancel = () => {
    navigate("/home");
  };

  const titleText = "Sửa Story";
  return (
    <div className="edit-story-container">
      <Header />
      <Sidebar />
      <h4 className="edit-story-header netflix-text">
        {titleText.split("").map((char, index) => (
          <span key={index} style={{ "--i": index }}>
            {char}
          </span>
        ))}
      </h4>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleUpdateStory} className="edit-story-form">
        <label htmlFor="content" className="visually-hidden">
          Nội dung story
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          placeholder="Nội dung"
          className="story-input"
          aria-required="true"
        />

        <div className="visibility-container">
          <label htmlFor="visibility" className="visibility-label">
            Chế độ hiển thị:
          </label>
          <select
            id="visibility"
            name="visibility"
            value={formData.visibility}
            onChange={handleInputChange}
            className="visibility-select"
            aria-label="Chọn chế độ hiển thị"
          >
            <option value="public">Công khai</option>
            <option value="private">Riêng tư</option>
          </select>
        </div>

        {preview.url && (
          <div className="media-preview" ref={previewContainerRef}>
            <h5 className="preview-title">Xem trước</h5>
            {preview.type === "video" ? (
              <video
                src={preview.url}
                className="preview-media"
                controls
                muted
                aria-label="Video story hiện tại"
              />
            ) : (
              <img
                src={preview.url}
                alt="Story preview"
                className="preview-media"
                ref={imageRef}
                aria-label="Ảnh story hiện tại"
              />
            )}
          </div>
        )}

        <div className="file-inputs">
          <div className="file-input-group">
            <label className="file-label" htmlFor="image">
              {formData.image ? formData.image.name : "Chọn ảnh mới"}
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              accept="image/*"
              className="file-input"
              aria-label="Tải lên ảnh mới"
            />
            {formData.image && (
              <button
                type="button"
                className="clear-file-btn"
                onClick={() => clearFile("image")}
                aria-label="Xóa ảnh đã chọn"
              >
                ✕
              </button>
            )}
          </div>
          <div className="file-input-group">
            <label className="file-label" htmlFor="video">
              {formData.video ? formData.video.name : "Chọn video mới"}
            </label>
            <input
              type="file"
              id="video"
              name="video"
              onChange={handleFileChange}
              accept="video/*"
              className="file-input"
              aria-label="Tải lên video mới"
            />
            {formData.video && (
              <button
                type="button"
                className="clear-file-btn"
                onClick={() => clearFile("video")}
                aria-label="Xóa video đã chọn"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Cập nhật Story
          </button>
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStory;