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

  // state가 없으면 다시 /find-id로
  if (!username) {
    navigate('/find-id');
    return null;
  }

  return (
    <div className="showid-background">
      <Header />
      <div className="showid-container">
        <div className="showid-box">
          <h2 className="showid-title">ID 찾기 성공</h2>
          <p className="showid-text">회원님의 아이디는</p>
          <p className="showid-username">{username}</p>
          <p className="showid-text">입니다.</p>

          <button
            className="showid-button"
            onClick={() => navigate('/auth')}
          >
            로그인으로 이동
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShowIDPage;
