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

      // 2) 백엔드가 토큰만 리턴하는 케이스(response.data가 문자열 JWT)인 경우:
      let token;
      if (typeof response.data === 'string') {
        token = response.data;
      } else {
        // 3) `{ token: "..." }` 형태로 리턴하는 케이스:
        token = response.data.token;
      }

      // 4) “로그인 상태 유지” 체크 여부에 따라 localStorage or sessionStorage에 저장
      if (credentials.remember) {
        localStorage.setItem('accessToken', token);
      } else {
        sessionStorage.setItem('accessToken', token);
      }

      // 5) axios 기본 헤더에 Authorization을 설정 (앞으로 모든 요청에 자동으로 첨부)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 6) 로그인 성공 후 "/"(메인)으로 이동
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 401) {
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
