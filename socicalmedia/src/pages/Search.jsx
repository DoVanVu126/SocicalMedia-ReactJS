import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import '../style/Search.css';
import { animateBackground, sparkleMouseEffect, initGradientTextHover } from '../script';

export default function Search() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const historyRef = useRef(null);
  const controllerRef = useRef(new AbortController()); // Reference to keep track of the current request

  // Initialize effects and history
  useEffect(() => {
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

  // Hide intro after 2.2 seconds (1.2s animation + 1s display)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Search with debounce and AbortController to cancel previous requests
  useEffect(() => {
    if (keyword.trim().length < 2) {
      setResults([]);
      return;
    }

    // Cancel previous request if there's one in progress
    controllerRef.current.abort();
    controllerRef.current = new AbortController(); // Reset the controller for the new request

    const delayDebounce = setTimeout(() => {
      setIsLoading(true); // Show loading spinner

      fetch(`http://localhost:8000/api/users/search?q=${encodeURIComponent(keyword)}`, {
        signal: controllerRef.current.signal
      })
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setIsLoading(false); // Hide loading spinner

          // Only save keyword if it doesn't match a result
          const matched = data.some(user => user.username === keyword);
          if (!matched && keyword && !searchHistory.includes(keyword)) {
            const updatedHistory = [keyword, ...searchHistory.slice(0, 4)];
            setSearchHistory(updatedHistory);
            localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
          }
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error(err);
            setIsLoading(false); // Hide loading spinner in case of error
          }
        });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword, searchHistory]);

  const handleUserClick = (user) => {
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

  const titleText = "Search";
  const letters = titleText.split('');

  if (showIntro) {
    return (
      <div className="search-intro-container">
        <div className="search-intro-text">
          {letters.map((letter, index) => (
            <span
              key={index}
              className={`search-intro-letter ${index === 0 ? 'search-s' : 'search-rest'}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Function to highlight matching parts of the username
  const highlightMatch = (username) => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return username.replace(regex, '<span class="highlight">$1</span>');
  };

  return (
    <div className="container">
      <Header />
      <Sidebar />
      <div className="main">
        <div className="search-container">
          <h2 className="netflix-text">
            {titleText.split("").map((char, index) => (
              <span key={index} style={{ "--i": index }}>{char}</span>
            ))}
          </h2>

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

         {isLoading && (
  <div className="l">
  
    Đang tìm kiếm...
  </div>
)}

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
                  <div className="search-name" dangerouslySetInnerHTML={{ __html: highlightMatch(user.username) }} />
                  <div className="search-username">@{user.username}</div>
                </div>
              </li>
            ))}

            {results.length === 0 && keyword.length >= 10 && (
              <div className="no-results shake">Không tìm thấy người dùng phù hợp.</div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
