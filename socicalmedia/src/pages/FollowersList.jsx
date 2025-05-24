import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/FollowersList.css";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function FollowersList({ type }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const size = 6;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const uid = parseInt(localStorage.getItem("user_id"));
    if (uid) setCurrentUserId(uid);
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const endpoint = `http://localhost:8000/api/users/${userId}/${type}?page=${page}&size=${size}&currentUserId=${currentUserId}`;

    setLoading(true);
    setError(null);

    axios
      .get(endpoint)
      .then((res) => {
        const { items, totalPages } = res.data;
        setUsers(items || []);
        setTotalPages(totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Không thể tải danh sách người dùng.");
        setLoading(false);
      });
  }, [userId, type, page, currentUserId]);

  const toggleFollow = (targetUserId, isFollowing) => {
    const url = isFollowing
      ? "http://localhost:8000/api/unfollow"
      : "http://localhost:8000/api/follow";

    axios
      .post(url, {
        follower_id: currentUserId,
        followed_id: targetUserId,
      })
      .then(() => {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === targetUserId ? { ...u, isFollowing: !isFollowing } : u
          )
        );
      })
      .catch((err) => {
        console.error("Lỗi khi thay đổi trạng thái theo dõi:", err);
      });
  };

  return (
    <div className="followers-list">
      <Header />
      <Sidebar />

      <button className="back-button" onClick={() => navigate(-1)}>
        &times;
      </button>

      <h2>{type === "followers" ? "Người theo dõi" : "Đang theo dõi"}</h2>

      {loading && <p>Đang tải danh sách...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && users.length === 0 ? (
        <p>Không có người dùng.</p>
      ) : (
        <>
          <ul>
            {users.map((u) => (
              <li key={u.id}>
                <span>@{u.username}</span>
                {u.id !== currentUserId && (
                  <button
                    onClick={() => toggleFollow(u.id, u.isFollowing)}
                    className={u.isFollowing ? "unfollow" : "follow"}
                  >
                    {u.isFollowing ? "Hủy theo dõi" : "Theo dõi"}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Trang trước
            </button>
            <span>
              Trang {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}
