// src/pages/ShowIDPage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ShowIDPage.css';

const ShowIDPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // navigate()를 통해 전달된 state
  const { username } = location.state || {};

  // 만약 사용자가 직접 이 URL로 들어와서 state가 없는 경우, 로그인 페이지로 돌려보냅니다.
  if (!username) {
    navigate('/find-id');
    return null;
  }

  return (
    <div className="showid-background">
      <Header />
      <div className="showid-box">
        <h2 className="showid-title">ID 찾기 성공</h2>
        <p className="showid-text">회원님의 아이디는</p>
        <p className="showid-username">{username}</p>
        <p className="showid-text">입니다.</p>

        <button
          className="showid-button"
          onClick={() => navigate('/login')}
        >
          로그인으로 이동
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default ShowIDPage;
