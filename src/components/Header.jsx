// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(null);
  const [roles, setRoles] = useState([]);  // 관리자 권한 체크용

  useEffect(() => {
    // 1) 저장소에서 토큰 불러오기
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    if (!token) {
      setNickname(null);
      setRoles([]);
      return;
    }

    try {
      // 2) JWT 페이로드 디코딩 (Base64URL → Base64)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // 3) atob → Latin1 → percent-encoding → UTF-8 디코딩
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      // 4) nickname, roles 추출
      setNickname(payload.nickname || payload.sub || payload.username);
      setRoles(payload.roles || []);
    } catch (e) {
      console.error('JWT 디코딩 실패:', e);
      setNickname(null);
      setRoles([]);
    }
  }, []);

  const handleLogout = () => {
    // 5) 토큰 삭제
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/');
    setNickname(null);
    setRoles([]);
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
            <span className="greeting-text">{nickname}님, 반갑습니다!</span>

            {roles.includes('ADMIN') ? (
              <Link to="/admin" className="profile-link">
                관리자 페이지
              </Link>
            ) : (
              <Link to="/profile" className="profile-link">
                내 정보 보기
              </Link>
            )}

            <button className="logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </>
        )}

        <button className="play-button">지금 플레이</button>
      </div>
    </header>
  );
}

export default Header;
