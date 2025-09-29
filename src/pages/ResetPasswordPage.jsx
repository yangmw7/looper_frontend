// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const navigate = useNavigate();

  // FindPasswordPage에서 전달받은 username
  const { username } = location.state || {};

  useEffect(() => {
    if (!username) {
      navigate('/find-password');
    }
  }, [username, navigate]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/reset-password`, {
        username: username,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      const data = response.data;

      if (data.message) {
        alert('비밀번호가 변경되었습니다.');
        navigate('/auth');
      } else {
        setErrorMsg(data.error);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('서버 오류로 인해 비밀번호 변경에 실패했습니다.');
    }
  };

  return (
    <div className="resetpw-background">
      <Header />

      <div className="resetpw-container">
        <div className="resetpw-box">
          <h2 className="resetpw-title">비밀번호 재설정</h2>
          <p className="resetpw-info">{username} 님, 새 비밀번호를 입력해 주세요.</p>

          <form onSubmit={handleSubmit} className="resetpw-form">
            <label htmlFor="newPassword" className="resetpw-label">새 비밀번호</label>
            <input
              type="password"
              id="newPassword"
              className="resetpw-input"
              placeholder="새 비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <label htmlFor="confirmPassword" className="resetpw-label">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              className="resetpw-input"
              placeholder="비밀번호 확인 입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {errorMsg && <p className="resetpw-error">{errorMsg}</p>}

            <button type="submit" className="resetpw-button">
              비밀번호 변경
            </button>
          </form>

          <div className="resetpw-footer-links">
            <a href="/find-password" className="resetpw-link">정보 다시 확인하기</a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
