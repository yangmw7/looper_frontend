// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    remember: false,
  });
  const [loading, setLoading] = useState(false);

  // 1) 컴포넌트가 마운트될 때, 로컬/세션 스토리지에 이미 토큰이 있으면
  //    axios 기본 헤더에 Authorization을 설정해 두고, 바로 홈으로 리다이렉트
  useEffect(() => {
    const storedToken =
      localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      navigate('/'); // 이미 로그인된 상태라면 메인으로 이동
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const payload = {
      username: credentials.username,
      password: credentials.password,
    };
    const response = await axios.post('http://localhost:8080/api/login', payload);

    // (로그인 성공 로직은 그대로)
    let token;
    if (typeof response.data === 'string') {
      token = response.data;
    } else {
      token = response.data.token;
    }

    if (credentials.remember) {
      localStorage.setItem('accessToken', token);
    } else {
      sessionStorage.setItem('accessToken', token);
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    navigate('/');
  } catch (err) {
    // 1) 서버가 “응답(response)”을 줬으면 (401, 404, 500 등) 모두 아이디/비밀번호 오류 메시지
    if (err.response) {
      alert('아이디 또는 비밀번호가 올바르지 않습니다.');
    } 
    // 2) 응답 없이 요청 자체가 실패한 경우(서버가 아예 안 뜨거나 CORS 에러 등)
    else {
      alert('서버에 연결할 수 없습니다.');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-background">
      <Header />
      <div className="login-container">
        <h2 className="login-title">ID 로그인</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            className="login-input"
            type="text"
            placeholder="ID"
            value={credentials.username}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            className="login-input"
            type="password"
            placeholder="비밀번호"
            value={credentials.password}
            onChange={handleChange}
            required
          />
          <div className="login-checkbox">
            <input
              name="remember"
              type="checkbox"
              id="remember"
              checked={credentials.remember}
              onChange={handleChange}
            />
            <label htmlFor="remember">로그인 상태 유지</label>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="login-links">
          <Link to="/signup">회원가입</Link>
          <Link to="/find-id">ID 찾기</Link>
          <Link to="/find-password">비밀번호 찾기</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
