// src/pages/FailPasswordPage.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './FailPasswordPage.css';

const FailPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // FindPasswordPage에서 보내준 에러 메시지
  const { errorMessage } = location.state || {};

  // state.errorMessage가 없으면 다시 /find-password 페이지로
  useEffect(() => {
    if (!errorMessage) {
      navigate('/find-password');
    }
  }, [errorMessage, navigate]);

  return (
    <div className="failpw-background">
      <Header />

      <div className="failpw-container">
        <div className="failpw-box">
          <h2 className="failpw-title">비밀번호 찾기 실패</h2>
          <p className="failpw-text">{errorMessage}</p>
          <button
            className="failpw-button"
            onClick={() => navigate('/find-password')}
          >
            다시 시도하기
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FailPasswordPage;
