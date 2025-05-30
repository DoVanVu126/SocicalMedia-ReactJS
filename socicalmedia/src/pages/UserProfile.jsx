import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StoryViewer from '../components/StoryViewer';
import '../style/UserProfile.css';
import { initMagnetEffect } from '../script';

export default function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followCount, setFollowCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [bio, setBio] = useState('Chưa có tiểu sử');
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [comments, setComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const [selectedCommentPostId, setSelectedCommentPostId] = useState(null);
    const [expandedPosts, setExpandedPosts] = useState({});
    const [showReactions, setShowReactions] = useState(null);
    const [reactionList, setReactionList] = useState({});
    const [showReactionList, setShowReactionList] = useState(null);
    const [activeMenuPostId, setActiveMenuPostId] = useState(null);
    const [stories, setStories] = useState([]);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const reactionListRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize magnet effect
    useEffect(() => {
        initMagnetEffect();
    }, []);

    // Hide intro animation after 1.7 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
            setLoading(false);
        }, 1700);
        return () => clearTimeout(timer);
    }, []);

    // Get current user ID from localStorage
    useEffect(() => {
        const savedUserId = localStorage.getItem('user_id');
        if (savedUserId) {
            const id = parseInt(savedUserId, 10);
            if (!isNaN(id)) setCurrentUserId(id);
            else setError('ID người dùng không hợp lệ.');
        } else {
            setError('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
        }
    }, []);

    // Fetch user data
    const fetchUserData = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:8000/api/users/${userId}`);
            if (!res.ok) throw new Error('Không tìm thấy người dùng');
            const data = await res.json();
            setUser(data);
            setFollowCount(data.followers_count || 0);
            setFollowingCount(data.following_count || 0);
            setBio(data.bio || 'Chưa có tiểu sử');
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchUserPosts = async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`http://localhost:8000/api/users/${userId}/posts`);
            // Backend (getUserPosts) đã lọc bài viết theo userId, nên bạn không cần filter lại ở frontend
            setPosts(res.data);
        } catch (err) {
            console.error('Lỗi khi lấy bài viết:', err);
            setError('Không thể tải bài viết');
        }
    };

    // Fetch user stories
    const fetchUserStories = async () => {
        if (!userId || !currentUserId) return;
        try {
            const res = await axios.get('http://localhost:8000/api/stories', {
                params: { user_id: userId }, // Sử dụng userId để lấy story của người dùng hiện tại
            });
            const userStories = res.data.filter(
                (story) => story.user_id === parseInt(userId, 10)
            );
            if (userStories.length === 0) {
                setError('Không có story nào để hiển thị.');
            }
            setStories(userStories);
        } catch (err) {
            console.error('Lỗi khi lấy stories:', err);
            setError('Không thể tải stories: ' + err.message);
        }
    };

    // Call fetch functions when userId changes
    useEffect(() => {
        if (!showIntro) {
            fetchUserData();
            fetchUserPosts();
        }
    }, [userId, showIntro]);

    // Check follow status
    useEffect(() => {
        if (!user || !currentUserId || user.id === currentUserId) return;
        axios
            .post('http://localhost:8000/api/follow-status', {
                follower_id: currentUserId,
                followed_id: user.id,
            })
            .then((res) => {
                setIsFollowing(res.data.isFollowing || false);
            })
            .catch(() => setIsFollowing(false));
    }, [user, currentUserId]);

    // Open StoryViewer when stories are updated
    useEffect(() => {
        if (stories.length > 0) {
            setIsViewerOpen(true);
        }
    }, [stories]);

    // Follow or unfollow
    const toggleFollow = () => {
        if (processing || !currentUserId) return;
        setProcessing(true);
        const url = isFollowing
            ? 'http://localhost:8000/api/unfollow'
            : 'http://localhost:8000/api/follow';
        axios
            .post(url, {
                follower_id: currentUserId,
                followed_id: user.id,
            })
            .then(() => {
                setIsFollowing(!isFollowing);
                setFollowCount((prev) => (isFollowing ? prev - 1 : prev + 1));
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Lỗi khi thao tác follow');
            })
            .finally(() => setProcessing(false));
    };

    // Edit bio
    const handleBioEdit = () => setIsEditingBio(true);

    const handleBioSave = () => {
        if (!user) return;
        setProcessing(true);
        axios
            .put(`http://localhost:8000/api/users/${user.id}/bio`, { bio })
            .then(() => {
                setUser((prev) => ({ ...prev, bio }));
                setIsEditingBio(false);
            })
            .catch(() => {
                setError('Lỗi khi lưu tiểu sử');
            })
            .finally(() => setProcessing(false));
    };

    const handleBioChange = (e) => setBio(e.target.value);

    // Handle avatar click and view stories
    const handleAvatarClick = () => {
        if (user?.has_active_stories && (currentUserId === user.id || isFollowing)) {
            fetchUserStories();
        } else if (currentUserId === user.id) {
            fetchUserStories(); // Kiểm tra story của chính mình
            if (fileInputRef.current) {
                fileInputRef.current.click(); // Cho phép chọn file ảnh
            }
        } else if (user?.has_active_stories && !isFollowing) {
            setError('Hãy theo dõi người dùng này để xem tin của họ!');
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setError('Vui lòng chọn file ảnh (JPEG, PNG, JPG)');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('Ảnh phải nhỏ hơn 2MB');
            return;
        }
        const formData = new FormData();
        formData.append('profilepicture', file);
        setProcessing(true);
        try {
            const res = await axios.post(
                `http://localhost:8000/api/users/${user.id}/profile-picture`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setUser((prev) => ({ ...prev, profilepicture: res.data.profilepicture }));
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi tải ảnh avatar');
        } finally {
            setProcessing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Handle comment submission
    const handleCommentSubmit = async (postId) => {
        const content = commentInputs[postId];
        if (!content) return;
        try {
            const res = await fetch(`http://localhost:8000/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUserId, content }),
            });
            if (!res.ok) throw new Error('Lỗi khi gửi bình luận');
            await fetchComments(postId);
            setCommentInputs({ ...commentInputs, [postId]: '' });
        } catch (error) {
            setError('Không thể gửi bình luận');
        }
    };

    const fetchComments = async (postId) => {
        const res = await fetch(`http://localhost:8000/api/posts/${postId}/comments`);
        const data = await res.json();
        setComments((prev) => ({ ...prev, [postId]: data }));
    };

    // Handle reactions
    const fetchReactionList = async (postId) => {
        try {
            const res = await axios.get(`http://localhost:8000/api/posts/${postId}/reactions`);
            setReactionList((prev) => ({ ...prev, [postId]: res.data }));
        } catch (err) {
            setError('Không thể tải danh sách cảm xúc');
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

    const handleReactionClick = async (postId, reactionType = null) => {
        if (!currentUserId) {
            setError('Vui lòng đăng nhập để thực hiện hành động này');
            return;
        }
        const post = posts.find((p) => p.id === postId);
        let newPosts = [...posts];
        let updatedPost = { ...post };
        if (post.user_reaction) {
            if (reactionType === null || post.user_reaction.type === reactionType) {
                updatedPost = {
                    ...updatedPost,
                    user_reaction: null,
                    reaction_summary: {
                        ...updatedPost.reaction_summary,
                        [post.user_reaction.type]: (updatedPost.reaction_summary[post.user_reaction.type] || 1) - 1,
                    },
                };
            } else {
                updatedPost = {
                    ...updatedPost,
                    user_reaction: { user_id: currentUserId, post_id: postId, type: reactionType },
                    reaction_summary: {
                        ...updatedPost.reaction_summary,
                        [post.user_reaction.type]: (updatedPost.reaction_summary[post.user_reaction.type] || 1) - 1,
                        [reactionType]: (updatedPost.reaction_summary[reactionType] || 0) + 1,
                    },
                };
            }
        } else if (reactionType || reactionType === null) {
            const newReactionType = reactionType || 'like';
            updatedPost = {
                ...updatedPost,
                user_reaction: { user_id: currentUserId, post_id: postId, type: newReactionType },
                reaction_summary: {
                    ...updatedPost.reaction_summary,
                    [newReactionType]: (updatedPost.reaction_summary[newReactionType] || 0) + 1,
                },
            };
        }
        newPosts = newPosts.map((p) => (p.id === postId ? updatedPost : p));
        setPosts(newPosts);
        setShowReactions(null);
        try {
            if (post.user_reaction && (reactionType === null || post.user_reaction.type === reactionType)) {
                await axios.delete(`http://localhost:8000/api/posts/${postId}/react`, {
                    data: { user_id: currentUserId },
                });
            } else if (reactionType || reactionType === null) {
                const newReactionType = reactionType || 'like';
                await axios.post(`http://localhost:8000/api/posts/${postId}/react`, {
                    user_id: currentUserId,
                    type: newReactionType,
                });
            }
        } catch (err) {
            setError('Không thể xử lý reaction');
            setPosts(posts);
        }
    };

    const renderReaction = (type) => {
        const icons = { like: '👍', love: '❤️', haha: '😂', wow: '😲', sad: '😢', angry: '😡' };
        return icons[type] || '👍';
    };

    const renderButtonLabel = (userReaction) => {
        if (!userReaction) return '👍 Thích';
        const labels = {
            like: '👍 Thích',
            love: '❤️ Yêu thích',
            haha: '😂 Haha',
            wow: '😲 Wow',
            sad: '😢 Buồn',
            angry: '😡 Tức giận',
        };
        return labels[userReaction.type] || '👍 Thích';
    };

    const getTotalReactions = (summary) => {
        return Object.values(summary || {}).reduce((sum, count) => sum + count, 0);
    };

    const toggleExpandImages = (postId) => {
        setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    const handleEdit = (post) => {
        navigate(`/edit-post/${post.id}`, {
            state: { content: post.content, imageUrl: post.imageurl, videoUrl: post.videourl },
        });
    };

    // Handle click outside to close menu
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
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMenuPostId, showReactionList]);

    // Split "Personal Page" into individual letters for animation
    const title = "Personal Page";
    const letters = title.split('');

    if (showIntro) {
        return (
            <div className="profile-intro-container">
                <div className="profile-intro-text">
                    {letters.map((letter, index) => (
                        <span
                            key={index}
                            className="profile-intro-letter"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container min-h-screen flex flex-col bg-gray-100">
                <Header />
                <Sidebar />
                <p className="text-center text-red-600 p-6 bg-red-50 rounded-lg mx-auto max-w-2xl mt-6">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="app-container min-h-screen flex flex-col bg-gray-100">
            <Header />
            <div className="main-content flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="profile-container flex-1 p-6 overflow-y-auto bg-gradient-to-b from-indigo-100 to-gray-100">
                    {user && (
                        <div className="profile-card">
                            <div className="avatar-wrapper">
                                <img
                                    src={
                                        user.profilepicture
                                            ? `http://localhost:8000/storage/images/${user.profilepicture}`
                                            : '/default-avatar.png'
                                    }
                                    alt={`${user.username} avatar`}
                                    className={`avatars ${user.has_active_stories ? 'has-story' : ''}`}
                                    onClick={handleAvatarClick}
                                    style={{
                                        cursor:
                                            user.has_active_stories || currentUserId === user.id
                                                ? 'pointer'
                                                : 'default',
                                    }}
                                    onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                                    aria-label={
                                        user.has_active_stories
                                            ? `Xem tin của ${user.username}`
                                            : `Ảnh đại diện của ${user.username}`
                                    }
                                />
                                {currentUserId === user.id && (
                                    <>
                                        <div className="magnet-wrapper">
                                            <button
                                                className="avatar-upload-btn magnet"
                                                onClick={() => fileInputRef.current.click()}
                                                disabled={processing}
                                                title="Thay đổi ảnh đại diện"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarUpload}
                                            accept="image/jpeg,image/png,image/jpg"
                                            style={{ display: 'none' }}
                                        />
                                    </>
                                )}
                            </div>

                            <div className="info">
                                <h1 className="name">{user.username}</h1>
                                <p className="username">@{user.username}</p>

                                <div className="stats">
                                    <div>
                                        <strong>{posts.length}</strong> Bài viết
                                    </div>
                                    <div
                                        className="clickable"
                                        onClick={() => navigate(`/users/${user.id}/followers`)}
                                    >
                                        <strong>{followCount}</strong> Người theo dõi
                                    </div>
                                    <div
                                        className="clickable"
                                        onClick={() => navigate(`/users/${user.id}/following`)}
                                    >
                                        <strong>{followingCount}</strong> Đang theo dõi
                                    </div>
                                </div>

                                <p>
                                    <strong className="Email">Email:</strong> {user.email}
                                </p>
                                <p>
                                    <strong className="SDT">SĐT:</strong> {user.phone || 'Chưa cập nhật'}
                                </p>

                                <div className="bio-section">
                                    <strong className="bio">Tiểu sử:</strong>
                                    {currentUserId === user.id && isEditingBio ? (
                                        <div className="bio-edit">
                                            <input
                                                value={bio}
                                                onChange={handleBioChange}
                                                placeholder="Nhập tiểu sử..."
                                                className="bio-input"
                                                disabled={processing}
                                            />
                                            <button
                                                onClick={handleBioSave}
                                                className="bio-save-button"
                                                disabled={processing}
                                            >
                                                Lưu
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bio-display">
                                            <p>{bio}</p>
                                            {currentUserId === user.id && (
                                                <span
                                                    className="edit-icon"
                                                    onClick={handleBioEdit}
                                                    title="Chỉnh sửa tiểu sử"
                                                >
                          ✏️
                        </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {user.id !== currentUserId && (
                                    <button
                                        onClick={toggleFollow}
                                        disabled={processing}
                                        className={`follow-button ${isFollowing ? 'following' : ''}`}
                                    >
                                        {isFollowing ? 'Đã theo dõi' : 'Theo dõi'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    <p className="text-p">Bài viết</p>

                    <div className="user-posts">
                        <h2>Bài viết</h2>
                        {posts.length === 0 ? (
                            <p className="no-posts">Người dùng chưa có bài viết nào.</p>
                        ) : (
                            <div className="posts-lists">
                                {posts.map((post) => (
                                    <div className="posts" key={post.id}>
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
                                                {post.user?.id === currentUserId && (
                                                    <>
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
                                                        {activeMenuPostId === post.id && (
                                                            <div className="options-menu" ref={menuRef}>
                                                                <button onClick={() => handleEdit(post)}>📝 Sửa</button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
                                                                            setLoading(true);
                                                                            axios
                                                                                .delete(`http://localhost:8000/api/posts/${post.id}`, {
                                                                                    data: { user_id: currentUserId },
                                                                                })
                                                                                .then(() => {
                                                                                    setPosts(posts.filter((p) => p.id !== post.id));
                                                                                })
                                                                                .catch(() => {
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
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <p className="post-content">{post.content}</p>

                                        <div className="post-media">
                                            {Array.isArray(post.imageurl) && (
                                                <>
                                                    {(expandedPosts[post.id]
                                                            ? post.imageurl
                                                            : post.imageurl.slice(0, 4)
                                                    ).map((img, index) => (
                                                        <div key={index} className="image-wrapper">
                                                            <img
                                                                src={`http://localhost:8000/storage/images/${img}`}
                                                                alt={`Ảnh ${index + 1}`}
                                                                className="media-images"
                                                            />
                                                            {index === 3 &&
                                                                post.imageurl.length > 4 &&
                                                                !expandedPosts[post.id] && (
                                                                    <div
                                                                        className="image-overlay"
                                                                        onClick={() => toggleExpandImages(post.id)}
                                                                    >
                                                                        +{post.imageurl.length - 4} ảnh
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
                              style={{ cursor: 'pointer' }}
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
                                                        style={{ cursor: 'pointer' }}
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
                                                                                        : '/default-avatar.png'
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
                                                    className={`like-button ${post.user_reaction ? 'reacted' : ''}`}
                                                    onClick={() => handleReactionClick(post.id)}
                                                >
                                                    {renderButtonLabel(post.user_reaction)}
                                                </button>
                                                {showReactions === post.id && (
                                                    <div className="reaction-icons">
                                                        {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map((type) => (
                                                            <button
                                                                key={type}
                                                                className={`reaction-icon ${
                                                                    post.user_reaction?.type === type ? 'selected' : ''
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
                                            <button onClick={() => alert('Chức năng chia sẻ chưa được triển khai')}>
                                                🔗 Chia sẻ
                                            </button>
                                        </div>

                                        {selectedCommentPostId === post.id && (
                                            <div className="add-comment">
                                                <input
                                                    type="text"
                                                    placeholder="Viết bình luận..."
                                                    value={commentInputs[post.id] || ''}
                                                    onChange={(e) =>
                                                        setCommentInputs({
                                                            ...commentInputs,
                                                            [post.id]: e.target.value,
                                                        })
                                                    }
                                                />
                                                <button onClick={() => handleCommentSubmit(post.id)}>Gửi</button>
                                            </div>
                                        )}

                                        {selectedCommentPostId === post.id && comments[post.id]?.length > 0 && (
                                            <div className="comments">
                                                {comments[post.id].map((comment) => (
                                                    <div key={comment.id} className="comment">
                                                        <strong>{comment.user?.username || 'Người dùng'}:</strong>{' '}
                                                        {comment.content}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {isViewerOpen && (
                        <StoryViewer
                            stories={stories}
                            onClose={() => {
                                setIsViewerOpen(false);
                                setStories([]);
                                setError(null);
                            }}
                            initialIndex={0}
                            onNextUser={() => setIsViewerOpen(false)}
                            onPrevUser={() => setIsViewerOpen(false)}
                            onDeleteStory={(id) => {
                                setStories(stories.filter((story) => story.id !== id));
                                if (stories.length === 1) {
                                    setUser((prev) => ({ ...prev, has_active_stories: false }));
                                }
                            }}
                            currentUserId={currentUserId}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}