// src/pages/FailIDPage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './FailIDPage.css';

const FailIDPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // navigate()를 통해 전달된 state
  const { errorMessage } = location.state || {};

  // state.errorMessage가 없으면 find-id 페이지로 돌려보냄
  if (!errorMessage) {
    navigate('/find-id');
    return null;
  }

  return (
    <div className="failid-background">
      <Header />
      <div className="failid-container">
        <div className="failid-box">
          <h2 className="failid-title">ID 찾기 실패</h2>
          <p className="failid-text">{errorMessage}</p>
          <button
            className="failid-button"
            onClick={() => navigate('/find-id')}
          >
            다시 시도하기
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FailIDPage;
