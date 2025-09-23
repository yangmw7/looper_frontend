// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LoginPage.css';

const LoginPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    remember: false,
  });
  const [loading, setLoading] = useState(false);

  // 이미 토큰이 있으면 axios 헤더 세팅 후 이동
  useEffect(() => {
    const storedToken =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      navigate('/');
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
      // 로그인 요청
      const response = await axios.post(
        `${API_BASE_URL}/api/login`,
        {
          username: credentials.username,
          password: credentials.password,
        }
      );

      // token 문자열 추출
      let token;
      if (typeof response.data === 'string') {
        token = response.data;
      } else {
        token = response.data.token;
      }

      // 1) 토큰 저장
      if (credentials.remember) {
        localStorage.setItem('accessToken', token);
      } else {
        sessionStorage.setItem('accessToken', token);
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 2) 페이로드 디코딩해서 roles 저장
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        const roles = payload.roles || [];
        // 항상 로컬에 저장해서 AdminRoute가 읽게 함
        localStorage.setItem('roles', JSON.stringify(roles));
      } catch (err) {
        console.error('JWT 디코딩 실패:', err);
      }

      // 로그인 후 메인 페이지로
      navigate('/');
    } catch (err) {
      if (err.response) {
        alert('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
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
