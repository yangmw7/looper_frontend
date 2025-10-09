// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [nickname, setNickname] = useState(null);
  const [roles, setRoles] = useState([]);

  // 토큰에서 사용자 정보 디코딩
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    if (!token) {
      setNickname(null);
      setRoles([]);
      return;
    }

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

      setNickname(payload.nickname || payload.sub || payload.username);
      setRoles(payload.roles || []);
    } catch (e) {
      console.error('JWT 디코딩 실패:', e);
      setNickname(null);
      setRoles([]);
    }
  }, []);

  // 로그아웃
  const handleLogout = async () => {
    try {
      const token =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');

      if (!token) {
        alert('이미 로그아웃 상태입니다.');
        return;
      }

      // JWT payload에서 username 추출
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      const username = payload.sub || payload.username;

      // 백엔드 로그아웃 API 호출 → RefreshToken 삭제
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        { username }, // username 같이 보냄
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 프론트 스토리지에서 토큰 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('nickname');
      localStorage.removeItem('roles');

      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      delete axios.defaults.headers.common['Authorization'];

      alert('로그아웃 완료');
      navigate('/');
      setNickname(null);
      setRoles([]);
    } catch (err) {
      console.error('로그아웃 실패:', err);
      alert('로그아웃 실패');
    }
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <Link to="/">홈</Link>
        <Link to="/guide">게임 정보</Link>
        <Link to="/notice">공지사항</Link>
        <Link to="/community">커뮤니티</Link>
      </div>

      <div className="nav-right">
        {nickname ? (
          <>
            <span className="greeting-text">{nickname}님, 환영합니다!</span>

            {roles.includes('ADMIN') ? (
              <Link to="/admin" className="profile-link">
                관리자 페이지
              </Link>
            ) : (
              <Link to="/profile" className="profile-link">
                내 정보
              </Link>
            )}

            <button className="logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/auth">로그인 / 회원가입</Link>
          </>
        )}

        <button className="play-button" onClick={() => navigate('/play')}>
          지금 플레이
        </button>
      </div>
    </header>
  );
}

export default Header;
