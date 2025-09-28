// src/pages/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AuthPage.css';

const AuthPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const [loginCredentials, setLoginCredentials] = useState({
    username: '',
    password: '',
    remember: false,
  });

  const [signupForm, setSignupForm] = useState({
    email: '',
    username: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const storedToken =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    if (storedToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      navigate('/');
    }
  }, [navigate]);

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginCredentials((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username: loginCredentials.username,
        password: loginCredentials.password,
      });

      let token =
        typeof response.data === 'string'
          ? response.data
          : response.data.token;

      if (loginCredentials.remember) {
        localStorage.setItem('accessToken', token);
      } else {
        sessionStorage.setItem('accessToken', token);
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // JWT 디코딩 및 roles 저장
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
        localStorage.setItem('roles', JSON.stringify(roles));
      } catch (err) {
        console.error('JWT 디코딩 실패:', err);
      }

      navigate('/');
    } catch (err) {
      alert(
        err.response
          ? '아이디 또는 비밀번호가 올바르지 않습니다.'
          : '서버에 연결할 수 없습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const payload = {
        email: signupForm.email,
        username: signupForm.username,
        nickname: signupForm.nickname,
        password: signupForm.password,
      };
      const response = await axios.post(`${API_BASE_URL}/api/join`, payload);
      const message = response.data;

      if (message === '회원가입 성공') {
        alert(message);
        setIsLogin(true);
        setSignupForm({
          email: '',
          username: '',
          nickname: '',
          password: '',
          confirmPassword: '',
        });
      } else {
        alert(message);
      }
    } catch {
      alert('서버에 연결할 수 없습니다.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-background">
      <Header />
      <div className="auth-container">
        {/* 상단 토글 영역 */}
        <div className="toggle-header">
          <div className="toggle-labels">
            <span 
              className={`toggle-label ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              LOG IN
            </span>
            <span 
              className={`toggle-label ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              SIGN UP
            </span>
          </div>
          
          <div className="toggle-switch" onClick={toggleMode}>
            <div className={`toggle-slider ${isLogin ? 'login' : 'signup'}`}>
              <div className="arrow-icon"></div>
            </div>
          </div>
        </div>

        {/* 카드 컨테이너 */}
        <div className="card-wrapper">
          <div className={`card-container ${!isLogin ? 'flipped' : ''}`}>
            {/* 로그인 카드 */}
            <div className="card-front">
              <h2 className="auth-title">LOG IN</h2>
              <form onSubmit={handleLoginSubmit}>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    name="username"
                    className="auth-input"
                    type="text"
                    placeholder="아이디 입력"
                    value={loginCredentials.username}
                    onChange={handleLoginChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    name="password"
                    className="auth-input"
                    type="password"
                    placeholder="비밀번호 입력"
                    value={loginCredentials.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>

                <div className="remember-checkbox">
                  <input
                    name="remember"
                    type="checkbox"
                    id="remember"
                    checked={loginCredentials.remember}
                    onChange={handleLoginChange}
                  />
                  <label htmlFor="remember">로그인 상태 유지</label>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading ? '로그인 중...' : '로그인'}
                </button>

                <div className="forgot-password">
                  <a href="/find-password">비밀번호를 잊으셨나요?</a>
                </div>
              </form>
            </div>

            {/* 회원가입 카드 */}
            <div className="card-back">
              <h2 className="auth-title">SIGN UP</h2>
              <form onSubmit={handleSignupSubmit}>
                

                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input
                    name="email"
                    className="auth-input"
                    type="email"
                    placeholder="이메일 입력"
                    value={signupForm.email}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    name="nickname"
                    className="auth-input"
                    type="text"
                    placeholder="닉네임 입력"
                    value={signupForm.nickname}
                    onChange={handleSignupChange}
                    required
                  />
                </div> 

                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    name="username"
                    className="auth-input"
                    type="text"
                    placeholder="아이디 입력"
                    value={signupForm.username}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    name="password"
                    className="auth-input"
                    type="password"
                    placeholder="비밀번호 입력"
                    value={signupForm.password}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    name="confirmPassword"
                    className="auth-input"
                    type="password"
                    placeholder="비밀번호 확인"
                    value={signupForm.confirmPassword}
                    onChange={handleSignupChange}
                    required
                  />
                </div>

                <button type="submit" className="auth-submit-btn">
                  회원가입
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AuthPage;