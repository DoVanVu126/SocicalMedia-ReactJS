import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';

const Login = () => {
  const [imageLoading, setImageLoading] = useState(true);
  const [form, setForm] = useState({ email: '', password: '' });
  const [otpForm, setOtpForm] = useState({ otp_code: '' });
  const [message, setMessage] = useState('');
  const [isOtpRequired, setIsOtpRequired] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [fireworks, setFireworks] = useState([]);
  const fireworkContainerRef = useRef(null);
  const emailInputRef = useRef(null); // Tạo ref cho email input
  const passwordInputRef = useRef(null); // Tạo ref cho password input

  function createFloatingChar(inputElement, char) {
    const rect = inputElement.getBoundingClientRect();
    const selectionStart = inputElement.selectionStart;
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.left = rect.left + 'px';
    tempSpan.style.top = rect.top + 'px';
    tempSpan.textContent = inputElement.value.substring(0, selectionStart);
    document.body.appendChild(tempSpan);
    const charRect = tempSpan.getBoundingClientRect();
    document.body.removeChild(tempSpan);

    const baseX = rect.left + (charRect.width * 0.8);
    const baseY = rect.top + (rect.height / 2);

    const numberOfSparks = 5; // Số lượng "tia" pháo bông
    for (let i = 0; i < numberOfSparks; i++) {
      const spark = document.createElement('div');
      spark.classList.add('tiny-firework');
      // Thêm class màu ngẫu nhiên (tùy chọn)
      const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      spark.classList.add(`tiny-firework-${randomColor}`);

      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 10; // Khoảng cách "bay"

      const x = baseX + Math.cos(angle) * distance;
      const y = baseY + Math.sin(angle) * distance;

      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.animationDelay = `${Math.random() * 0.2}s`; // Tạo độ trễ ngẫu nhiên

      document.body.appendChild(spark);

      // Loại bỏ tia pháo bông sau khi animation kết thúc
      spark.addEventListener('animationend', () => {
        spark.remove();
      });
    }
  }

  useEffect(() => {
    const emailInput = emailInputRef.current;
    const passwordInput = passwordInputRef.current;

    const handleInput = (event) => {
      const lastChar = event.data;
      if (lastChar && event.target === emailInput) {
        createFloatingChar(emailInput, lastChar);
      }
      if (lastChar && event.target === passwordInput) {
        createFloatingChar(passwordInput, lastChar);
      }
    };

    if (emailInput) {
      emailInput.addEventListener('input', handleInput);
    }
    if (passwordInput) {
      passwordInput.addEventListener('input', handleInput);
    }

    return () => {
      if (emailInput) {
        emailInput.removeEventListener('input', handleInput);
      }
      if (passwordInput) {
        passwordInput.removeEventListener('input', handleInput);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const container = fireworkContainerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      const x = Math.random() * container.offsetWidth;
      const y = Math.random() * container.offsetHeight;

      const offsetX = (Math.random() - 0.5) * 100;
      const offsetY = (Math.random() - 0.5) * 100;

      const fw = {
        id: Date.now() + Math.random(),
        x,
        y,
        offsetX,
        offsetY,
        color: `hsl(${Math.random() * 360}, 100%, 60%)`
      };

      setFireworks((prev) => [...prev, fw]);

      // Xóa sau 1s để không bị tràn
      setTimeout(() => {
        setFireworks((prev) => prev.filter((f) => f.id !== fw.id));
      }, 1000);
    }, 400); // tạo mỗi 400ms

    return () => clearInterval(interval);
  }, []);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    if (e.target.name === 'otp_code') {
      setOtpForm({ ...otpForm, otp_code: e.target.value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // BƯỚC 1: Gửi email + password
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/login', form);

      if (res.data.requires_otp && res.data.user_id) {
        setMessage(res.data.message);
        setIsOtpRequired(true);
        setUserId(res.data.user_id);
        localStorage.setItem('user_id', res.data.user_id);
      } else {
        setMessage('Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  // BƯỚC 2: Gửi mã OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/verify-otp', {
        user_id: userId,
        otp_code: otpForm.otp_code,
      });

      if (res.data.message === 'Xác thực OTP thành công') {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setMessage(res.data.message);
        navigate('/home');
      }
    } catch (err) {
      console.error('OTP verification error:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Xác thực OTP thất bại');
    }
  };

  return (
    <div className="login" ref={fireworkContainerRef}>
      <div className="login-form-container">
        <form onSubmit={isOtpRequired ? handleOtpSubmit : handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
          <div class="pow-container">
            <span class="pow-letter">SocicalApp</span>
          </div>
          <h2 className="login-title">Đăng nhập</h2>

          {!isOtpRequired ? (
            <>
              <input
                type="email"
                name="email"
                className="input-field email-input"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                ref={emailInputRef} // Gán ref cho email input
              />
              <input
                type="password"
                name="password"
                className="input-field password-input"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={handleChange}
                required
                ref={passwordInputRef}
              />
              <div class="box">
                <div class="canvas">
                  <button type="submit" className="btn-login-big submit-btn0"></button>
                  <button type="submit" className="btn-login-big submit-btn1">Đăng nhập</button>
                  <button type="submit" className="btn-login-big submit-btn2">Đăng nhập</button>
                  <button type="submit" className="btn-login-big submit-btn3"></button>
                  <button type="submit" className="btn-login-small submit-btn4"></button>
                  <button type="submit" className="btn-login-small submit-btn5"></button>
                </div>
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                name="otp_code"
                className="input-field"
                placeholder="Nhập mã OTP"
                value={otpForm.otp_code}
                onChange={handleChange}
                required
              />
              <button type="submit" className="submit-btn">Xác thực OTP</button>
            </>
          )}

          {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}

          {!isOtpRequired && (
            <div className="signup-link">
              <p className="signup-text">
                Chưa có tài khoản? <a href="/register" className="signup-link-text">Đăng ký ngay</a>
              </p>
            </div>
          )}
        </form>
      </div>
      <div className="login-image-container" >
        {imageLoading && (
          <div className="image-loader">
            <div className="circle-loader"></div>
            <p className="text-loading">Đang tải ảnh...</p>
          </div>
        )}
        <img
          src="http://localhost:8000/storage/image/login-image2.jpg"
          alt="Login illustration"
          className="login-image"
          onLoad={() => setImageLoading(false)}
          onError={() => setImageLoading(false)}
          style={{ display: imageLoading ? 'none' : 'block' }}
        />
        {!imageLoading && <div className="curved-line curved-line-1"></div>}
        {!imageLoading && <div className="curved-line curved-line-2"></div>}
        {!imageLoading && <div className="curved-line curved-line-3"></div>}
      </div>
      {fireworks.map((fw) => (
        <div
          key={fw.id}
          className="firework"
          style={{
            left: `${fw.x}px`,
            top: `${fw.y}px`,
            '--x': `${fw.offsetX}px`,
            '--y': `${fw.offsetY}px`,
            backgroundColor: fw.color
          }}
        />
      ))}
    </div>
  );
};

export default Login;