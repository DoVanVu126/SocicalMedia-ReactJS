import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const userIDCMT = user?.id;

  const getImageUrl = (imageurl) => {
    if (!imageurl) return "/default-image.jpg";
    if (imageurl.startsWith("http")) return imageurl;
    return `http://localhost:8000/storage/story_images/${imageurl}`;
  };

  const story = location.state || {
    id: null,
    content: "",
    imageurl: null,
    videourl: null,
    visibility: "public",
    updated_at: null,
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
      ? story.videourl
      : story.imageurl
      ? getImageUrl(story.imageurl)
      : "/default-image.jpg",
  });

  const [errors, setErrors] = useState({});
  const [currentImageUrl, setCurrentImageUrl] = useState(
    story.imageurl ? getImageUrl(story.imageurl) : null
  );
  const currentPreviewUrl = useRef(null);
  const imageRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  useEffect(() => {
    const validateStoryId = async () => {
      if (!id || isNaN(id) || parseInt(id) <= 0) {
        setErrors({ general: "Không tìm thấy trang: ID không hợp lệ." });
        return;
      }

      if (!story.id) {
        try {
          const response = await axios.get(`http://localhost:8000/api/stories/${id}`);
          const fetchedStory = response.data;

          setFormData({
            content: fetchedStory.content || "",
            visibility: fetchedStory.visibility || "public",
            image: null,
            video: null,
          });
          setPreview({
            type: fetchedStory.videourl ? "video" : fetchedStory.imageurl ? "image" : null,
            url: fetchedStory.videourl
              ? fetchedStory.videourl
              : getImageUrl(fetchedStory.imageurl) || "/default-image.jpg",
          });
          setCurrentImageUrl(getImageUrl(fetchedStory.imageurl));
          story.id = fetchedStory.id;
          story.content = fetchedStory.content;
          story.imageurl = fetchedStory.imageurl;
          story.videourl = fetchedStory.videourl;
          story.visibility = fetchedStory.visibility;
          story.updated_at = fetchedStory.updated_at;
        } catch (err) {
          console.error("Lỗi khi lấy story:", err);
          setErrors({ general: "Không tìm thấy trang: Story không tồn tại." });
        }
      }
    };

    validateStoryId();
  }, [id, story]);

  useEffect(() => {
    if (story.id) {
      broadcastChannelRef.current = new BroadcastChannel(`story-${story.id}`);
      
      broadcastChannelRef.current.onmessage = (event) => {
        const updatedStory = event.data;
        if (updatedStory.id === story.id) {
          setFormData({
            content: updatedStory.content,
            visibility: updatedStory.visibility,
            image: null,
            video: null,
          });
          setPreview({
            type: updatedStory.videourl ? "video" : updatedStory.imageurl ? "image" : null,
            url: updatedStory.videourl || getImageUrl(updatedStory.imageurl) || "/default-image.jpg",
          });
          setCurrentImageUrl(getImageUrl(updatedStory.imageurl));
          story.updated_at = updatedStory.updated_at;
          setErrors({ general: "Story đã được cập nhật từ tab khác." });

          navigate("/home", {
            state: {
              id: updatedStory.id,
              content: updatedStory.content,
              visibility: updatedStory.visibility,
              imageurl: updatedStory.imageurl,
              videourl: updatedStory.videourl,
              updated_at: updatedStory.updated_at,
            },
          });
        }
      };

      return () => {
        broadcastChannelRef.current?.close();
      };
    }
  }, [story.id, navigate]);

  useEffect(() => {
    console.log("story.imageurl:", story.imageurl);
    console.log("currentImageUrl:", currentImageUrl);
    console.log("preview.url:", preview.url);
  }, [story.imageurl, currentImageUrl, preview.url]);

  useEffect(() => {
    if (!userIDCMT) {
      setErrors({ general: "Vui lòng đăng nhập để chỉnh sửa." });
      navigate("/home");
    }
  }, [userIDCMT, navigate]);

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
      if (preview.url && preview.type === "image" && imageRef.current) {
        disintegrate(() => {
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
        type: story.videourl ? "video" : currentImageUrl ? "image" : null,
        url: story.videourl
          ? story.videourl
          : currentImageUrl
          ? currentImageUrl
          : "/default-image.jpg",
      });
    }

    return () => {
      if (currentPreviewUrl.current) {
        URL.revokeObjectURL(currentPreviewUrl.current);
      }
    };
  }, [formData.image, formData.video, story.videourl, currentImageUrl]);

  const disintegrate = (callback) => {
    const img = imageRef.current;
    if (!img) return callback();

    const rect = img.getBoundingClientRect();
    const particleCount = 50;
    const particles = [];

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
      img.parentElement.appendChild(particle);
      particles.push(particle);
    }

    img.style.opacity = "0";

    particles.forEach((particle, index) => {
      particle.style.animation = `disintegrate 0.8s ease forwards ${
        index * 0.02
      }s`;
    });

    setTimeout(() => {
      particles.forEach((particle) => particle.remove());
      img.style.opacity = "1";
      callback();
    }, 1000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      const file = files[0];
      if (name === "image") {
        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
          setErrors({ ...errors, image: "File phải là ảnh." });
          return;
        }
      } else if (name === "video") {
        if (!["video/mp4", "video/avi", "video/x-matroska"].includes(file.type)) {
          setErrors({ ...errors, video: "File phải là video (mp4, avi, mkv)." });
          return;
        }
      }
      setFormData((prev) => ({
        ...prev,
        image: name === "image" ? files[0] : null,
        video: name === "video" ? files[0] : null,
      }));
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const clearFile = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: null,
    }));
    setErrors((prev) => ({ ...prev, [type]: null }));
    if (!formData.image && !formData.video && !currentImageUrl && !story.videourl) {
      setPreview({ type: null, url: "/default-image.jpg" });
    }
  };

  const validVisibilities = ["public", "private"];

  const handleUpdateStory = async (e) => {
    e.preventDefault();
    if (!userIDCMT) {
      setErrors({ general: "Vui lòng đăng nhập để chỉnh sửa." });
      return;
    }

    const trimmedContent = formData.content.trim();
    const hasInvalidSpace = /[\u2000-\u200B\u3000]/.test(trimmedContent);
    const hasHTML = /<[^>]+>/.test(trimmedContent);

    if (!validVisibilities.includes(formData.visibility)) {
      setErrors({ visibility: "Danh mục không tồn tại." });
      return;
    }
    if (!trimmedContent) {
      setErrors({ content: "Nội dung không được để trống hoặc chỉ chứa khoảng trắng." });
      return;
    }
    if (hasInvalidSpace) {
      setErrors({ content: "Nội dung không được chứa ký tự khoảng trắng 2-byte." });
      return;
    }
    if (hasHTML) {
      setErrors({ content: "Nội dung không được chứa mã HTML." });
      return;
    }
    if (trimmedContent.length > 1000) {
      setErrors({ content: "Nội dung quá dài, tối đa 1000 ký tự." });
      return;
    }

    const data = new FormData();
    data.append("user_id", userIDCMT);
    data.append("content", trimmedContent);
    data.append("visibility", formData.visibility);
    if (formData.image) {
      data.append("image", formData.image);
      data.append("update_image", "true");
    }
    if (formData.video) {
      data.append("video", formData.video);
    }
    if (story.updated_at) {
      data.append("last_updated_at", story.updated_at);
    } else {
      console.warn("Thiếu updated_at, API có thể trả về lỗi 409.");
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/api/stories/${story.id}?_method=PUT`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const updatedStory = response.data;

      broadcastChannelRef.current?.postMessage({
        id: updatedStory.id,
        content: updatedStory.content,
        imageurl: updatedStory.imageurl,
        videourl: updatedStory.videourl,
        visibility: updatedStory.visibility,
        updated_at: updatedStory.updated_at,
      });

      setCurrentImageUrl(getImageUrl(updatedStory.imageurl));
      setFormData({
        content: updatedStory.content,
        visibility: updatedStory.visibility,
        image: null,
        video: null,
      });
      setPreview({
        type: updatedStory.videourl ? "video" : updatedStory.imageurl ? "image" : null,
        url: updatedStory.videourl || getImageUrl(updatedStory.imageurl) || "/default-image.jpg",
      });
      story.updated_at = updatedStory.updated_at;

      alert("Cập nhật story thành công.");

      navigate("/home", {
        state: {
          id: updatedStory.id,
          content: updatedStory.content,
          visibility: updatedStory.visibility,
          imageurl: updatedStory.imageurl,
          videourl: updatedStory.videourl,
          updated_at: updatedStory.updated_at,
        },
      });
    } catch (err) {
      console.error("Lỗi khi sửa story:", err);

      if (err.response?.status === 409) {
        setErrors({
          general: "Story đã được cập nhật bởi tab khác. Dữ liệu đã được đồng bộ.",
        });
      } else if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {
          general: "Dữ liệu không hợp lệ.",
        });
      } else {
        setErrors({ general: "Không thể cập nhật story. Vui lòng thử lại." });
      }
    }
  };

  const handleCancel = () => {
    navigate("/home");
  };

  if (errors.general) {
    return (
      <div className="edit-story-container">
        <Header />
        <Sidebar />
        <div className="error-container">
          <p className="error">{errors.general}</p>
        </div>
      </div>
    );
  }

  const titleText = "Sửa Story";

  return (
    <div className="edit-story-container">
      <Header />
      <Sidebar />
      <h1 className="edit-story-header netflix-text">
        {titleText.split("").map((char, index) => (
          <span key={index} style={{ "--i": index }}>
            {char}
          </span>
        ))}
      </h1>
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
          required
        />
        {errors.content && <p className="error">{errors.content}</p>}

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
          >
            <option value="public">Công khai</option>
            <option value="private">Riêng tư</option>
          </select>
          {errors.visibility && <p className="error">{errors.visibility}</p>}
        </div>

        {preview.url && (
          <div className="media-preview">
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
                onError={(e) => {
                  console.error("Image load error:", preview.url);
                  e.target.src = "/default-image.jpg";
                }}
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
              accept="image/jpeg,image/png,image/jpg"
              className="file-input"
            />
            {formData.image && (
              <button
                type="button"
                className="clear-file-btn"
                onClick={() => clearFile("image")}
              >
                ✕
              </button>
            )}
            {errors.image && <p className="error">{errors.image}</p>}
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
              accept="video/mp4,video/avi,video/x-matroska"
              className="file-input"
            />
            {formData.video && (
              <button
                type="button"
                className="clear-file-btn"
                onClick={() => clearFile("video")}
              >
                ✕
              </button>
            )}
            {errors.video && <p className="error">{errors.video}</p>}
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