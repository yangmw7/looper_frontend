// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(null);

  useEffect(() => {
    // 1) 저장소에서 토큰 불러오기
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      setNickname(null);
      return;
    }

    try {
      // 2) JWT 페이로드 디코딩: header.payload.signature
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      // 3) payload에 nickname 클레임이 있다고 가정. 없으면 sub나 username 사용
      const nick = payload.nickname || payload.sub || payload.username;
      setNickname(nick);
    } catch (e) {
      console.error('JWT 디코딩 실패:', e);
      setNickname(null);
    }
  }, []);

  const handleLogout = () => {
    // 4) 토큰 삭제
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    // 5) axios 기본 헤더에서 Authorization 제거
    delete axios.defaults.headers.common['Authorization'];
    // 6) 로그인 페이지로 이동
    navigate('/login');
    // 7) 화면 갱신을 위해 nickname 상태 초기화
    setNickname(null);
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
            <Link to="/profile" className="profile-link">
              내 정보 보기
            </Link>
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
