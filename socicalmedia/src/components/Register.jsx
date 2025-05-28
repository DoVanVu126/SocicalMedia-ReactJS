import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../style/Register.css';

const Register = () => {

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    phone: ''
  });
  const [message, setMessage] = useState('');
  const [imageLoading, setImageLoading] = useState(true);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Ràng buộc các trường
    if (!form.username.trim()) {
      setMessage('Vui lòng nhập username.');
      return;
    }

    if (!form.email.trim()) {
      setMessage('Vui lòng nhập email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage('Email không hợp lệ.');
      return;
    }

    if (!form.password) {
      setMessage('Vui lòng nhập mật khẩu.');
      return;
    }

    if (form.password.length < 6) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (form.phone) {
      const phoneRegex = /^0[0-9]{8,10}$/;
      if (!phoneRegex.test(form.phone)) {
        setMessage('Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và gồm 9-11 chữ số).');
        return;
      }
    }


    try {
      const res = await axios.post('http://localhost:8000/api/register', form);
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      setMessage('Lỗi đăng ký: ' + (err.response?.data?.message || err.message));
    }
  };


  return (
    <div className="register" ref={fireworkContainerRef}>
      <div className="register-form-container">
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
          <h2 className="register-title">Đăng ký</h2>

          <input
            type="text"
            name="username"
            className="input-field"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            className="input-field"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            className="input-field"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            className="input-field"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="submit-btn" style={{ marginTop: '15px' }}>
            Đăng ký
          </button>

          {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}

          <div className="signup-link" style={{ marginTop: '12px' }}>
            <p className="signup-text">
              Đã có tài khoản? <a href="/login" className="signup-link-text">Đăng nhập ngay</a>
            </p>
          </div>
        </form>
      </div>

      <div className="register-image-container">
        {imageLoading && (
          <div className="image-loader">
            <div className="circle-loader"></div>
            <p className="text-loading">Đang tải ảnh...</p>
          </div>
        )}
        <img
          src="http://localhost:8000/storage/image/register-image4.png"
          alt="Register illustration"
          className="register-image"
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

export default Register;
