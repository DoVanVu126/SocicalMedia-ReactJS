import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Search.css';

export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (keyword.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetch(`http://localhost:8000/api/users/search?q=${encodeURIComponent(keyword)}`)
        .then(res => res.json())
        .then(data => setResults(data))
        .catch(err => console.error(err));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="search-container">
      <h2>Tìm kiếm người dùng</h2>
      <input
        type="text"
        placeholder="Nhập tên hoặc username..."
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        className="search-input"
      />

      <ul className="search-results">
        {results.map(user => (
          <li key={user.id} className="search-item" onClick={() => handleUserClick(user.id)} style={{ cursor: 'pointer' }}>
            <img
              src={user.profilepicture
  ? `http://localhost:8000/storage/images/${user.profilepicture}`
  : '/default-avatar.png'}
              alt={user.fullname || user.username}
              className="search-avatar"
            />
            <div className="search-info">
            <div className="search-name">{user.username}</div>
<div className="search-username">@{user.username}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
