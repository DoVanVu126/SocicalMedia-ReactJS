import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import '../style/Search.css';
import { initBlinkText, animateBackground, sparkleMouseEffect, initGradientTextHover } from '../script';


export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const historyRef = useRef(null);

  // Khởi tạo hiệu ứng và lịch sử
  useEffect(() => {
      initBlinkText();
  animateBackground();
  sparkleMouseEffect();
  initGradientTextHover();
    const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setSearchHistory(storedHistory);

    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        historyRef.current &&
        !historyRef.current.contains(e.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tìm kiếm có debounce
  useEffect(() => {
    if (keyword.trim().length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetch(`http://localhost:8000/api/users/search?q=${encodeURIComponent(keyword)}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setIsFocused(false);

          // Chỉ lưu keyword nếu nó KHÔNG nằm trong kết quả (tránh double)
          const matched = data.some(user => user.username === keyword);
          if (!matched && keyword && !searchHistory.includes(keyword)) {
            const updatedHistory = [keyword, ...searchHistory.slice(0, 4)];
            setSearchHistory(updatedHistory);
            localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
          }
        })
        .catch(err => console.error(err));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  const handleUserClick = (user) => {
    // Không thêm lại vào lịch sử nếu đã chọn từ danh sách
    const updatedHistory = [user.username, ...searchHistory.filter(h => h !== user.username)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    navigate(`/profile/${user.id}`);
  };

  const handleHistoryClick = (item) => {
    setKeyword(item);
    setIsFocused(false);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div className="container">
      <Header />
      <Sidebar />
      <div className="main">
        <div className="search-container">
          <h2 className="blink-text">Tìm kiếm người dùng</h2>

          <div className="search-input-wrapper" ref={inputRef}>
            <input
              type="text"
              placeholder="Nhập username..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="search-input"
            />
          </div>

          {/* Hiển thị lịch sử tìm kiếm */}
          {isFocused && searchHistory.length > 0 && results.length === 0 && (
            <div className="history-container" ref={historyRef}>
              <div className="history-header">
                <span>Lịch sử tìm kiếm</span>
                <button onClick={handleClearHistory} className="clear-history-btn">Xoá</button>
              </div>
              <ul className="history-list">
                {searchHistory.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleHistoryClick(item)}
                    className="history-item"
                  >
                    🔍 {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Kết quả tìm kiếm */}
          <ul className="search-results fade-in">
            {results.map(user => (
              <li
                key={user.id}
                className="search-item hover-grow"
                onClick={() => handleUserClick(user)}
              >
                <img
                  src={user.profilepicture
                    ? `http://localhost:8000/storage/images/${user.profilepicture}`
                    : '/default-avatar.png'}
                  alt={user.username}
                  className="search-avatar"
                />
                <div className="search-info">
                  <div className="search-name">{user.username}</div>
                  <div className="search-username">@{user.username}</div>
                </div>
              </li>
            ))}

            {/* Không có kết quả */}
            {results.length === 0 && keyword.length >= 4 && (
              <div className="no-results shake">Không tìm thấy người dùng phù hợp.</div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
