import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/users/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy người dùng');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Đang tải thông tin người dùng...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: 20 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Quay lại
      </button>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <img
          src={user.profilepicture
            ? `http://localhost:8000/storage/images/${user.profilepicture}`
            : '/default-avatar.png'}
          alt={user.username}
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
          onError={e => (e.currentTarget.src = '/default-avatar.png')}
        />
        <div>
          <h2>{user.fullname || user.username}</h2>
          <p><strong>Username:</strong> @{user.username}</p>
          <p><strong>Email:</strong> {user.email || 'Chưa cập nhật'}</p>
          <p><strong>Phone:</strong> {user.phone || 'Chưa cập nhật'}</p>
        </div>
      </div>
    </div>
  );
}
