import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../style/AddStory.css";

const Story = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newStory, setNewStory] = useState({
    content: "",
    visibility: "public",
    image: null,
    video: null,
  });
  const [editingStory, setEditingStory] = useState(null);
  const [showMenu, setShowMenu] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userIDCMT = user?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userIDCMT) return;
    setLoading(true);
    axios
      .get("http://localhost:8000/api/stories", { params: { user_id: userIDCMT } })
      .then((res) => {
        setStories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải story:", err);
        setLoading(false);
      });
  }, [userIDCMT]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStory({
      ...newStory,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setNewStory({
      ...newStory,
      [name]: files[0],
    });
  };

  const handleAddStory = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("user_id", userIDCMT);
    formData.append("content", newStory.content);
    formData.append("visibility", newStory.visibility);
    if (newStory.image) formData.append("image", newStory.image);
    if (newStory.video) formData.append("video", newStory.video);

    axios
      .post("http://localhost:8000/api/stories", formData)
      .then((res) => {
        setStories([res.data.story, ...stories]);
        setNewStory({
          content: "",
          visibility: "public",
          image: null,
          video: null,
        });
        navigate("/home"); // Chuyển về trang Home sau khi thêm thành công
      })
      .catch((err) => {
        console.error("Lỗi khi thêm story:", err);
      });
  };

  const handleDeleteStory = (id) => {
    axios
      .delete(`http://localhost:8000/api/stories/${id}`)
      .then(() => {
        setStories(stories.filter((story) => story.id !== id));
      })
      .catch((err) => {
        console.error("Lỗi khi xóa story:", err);
      });
  };

  const handleToggleMenu = (id) => {
    setShowMenu(showMenu === id ? null : id);
  };

  return (
    <div className="story-container">
      <Header/>
            <Sidebar />
      <div className="story-list row">
  {stories.map((story) => (
    <div key={story.id} className="story-item col-md-4">
      <img
        src={`http://localhost:8000/storage/story_images/${story.imageurl}`}
        alt="Story"
        className="story-image"
      />
      <div className="story-content">
        <p className="text">{story.content}</p>
        <span className="story-time">{new Date(story.created_at).toLocaleString()}</span>
      </div>
    </div>
  ))}
</div>

      {/* Add New Story Form */}
      <h4 className="add-story-header">Thêm Story mới</h4>
      <form onSubmit={handleAddStory} className="add-story-form">
        <textarea
          name="content"
          value={newStory.content}
          onChange={handleInputChange}
          placeholder="Nội dung"
          className="story-input"
        />
        <div className="visibility-container">
          <select name="visibility" value={newStory.visibility} onChange={handleInputChange} className="visibility-select">
            <option value="public">Công khai</option>
            <option value="private">Riêng tư</option>
          </select>
        </div>
        <div className="file-inputs">
          <label className="file-label">
            {newStory.image ? newStory.image.name : "Chọn ảnh"}
            <input type="file" name="image" onChange={handleFileChange} accept="image/*" className="file-input" />
          </label>
          <label className="file-label">
            {newStory.video ? newStory.video.name : "Chọn video"}
            <input type="file" name="video" onChange={handleFileChange} accept="video/*" className="file-input" />
          </label>
        </div>
        <button type="submit" className="submit-button">Thêm Story</button>
      </form>
    </div>
  );
};

export default Story;