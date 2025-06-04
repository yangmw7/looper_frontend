// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // FindPasswordPage에서 state로 전달한 username
  const { username } = location.state || {};

  // 만약 username이 없다면, 다시 /find-password로 돌아가도록 처리
  useEffect(() => {
    if (!username) {
      navigate('/find-password');
    }
  }, [username, navigate]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(''); // 비밀번호 불일치 또는 서버 오류 메시지

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const response = await axios.post(
        'http://localhost:8080/api/reset-password',
        {
          username: username,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        }
      );
      const data = response.data;
      // 성공: { message: "비밀번호가 성공적으로 변경되었습니다." }
      // 실패: { error: "비밀번호와 비밀번호 확인이 일치하지 않습니다." } 등

      if (data.message) {
        // 비밀번호 변경 성공 시 alert 띄우고 로그인 페이지로 이동
        alert('비밀번호가 변경이 완료되었습니다.');
        navigate('/login');
      } else {
        // error 필드가 있으면 화면에 표시
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

      <div className="resetpw-box">
        <h2 className="resetpw-title">비밀번호 재설정</h2>
        <p className="resetpw-info">
          {username} 님, 새 비밀번호를 입력해 주세요.
        </p>

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

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
