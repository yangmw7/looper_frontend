// src/pages/FindPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './FindPasswordPage.css';

const FindPasswordPage = () => {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1단계: 아이디+이메일 확인
      const response = await axios.post(
        'http://localhost:8080/api/reset-password/request',
        { username: userId, email: email }
      );

      const data = response.data; 
      // 성공: { message: "확인되었습니다. 비밀번호를 재설정하세요." }
      // 실패: { error: "입력한 정보가 일치하지 않습니다." }

      if (data.message) {
        // 다음 단계인 비밀번호 재설정 페이지로 이동
        // state에 username을 담아 보냄
        navigate('/reset-password', {
          state: { username: userId }
        });
      } else {
        // 에러 발생: 사용자 정보가 잘못됨
        navigate('/find-password/fail', {
          state: { errorMessage: data.error }
        });
      }
    } catch (err) {
      // 네트워크 오류나 기타 서버 오류
      console.error(err);
      navigate('/find-password/fail', {
        state: { errorMessage: '서버에 연결할 수 없습니다.' }
      });
    }
  };

  return (
    <div className="findpw-background">
      <Header />

      <div className="findpw-box">
        <h2 className="findpw-title">비밀번호 찾기</h2>
        <form onSubmit={handleSubmit} className="findpw-form">
          <label htmlFor="userId" className="findpw-label">아이디</label>
          <input
            type="text"
            id="userId"
            className="findpw-input"
            placeholder="가입한 아이디를 입력하세요"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <label htmlFor="email" className="findpw-label">이메일</label>
          <input
            type="email"
            id="email"
            className="findpw-input"
            placeholder="가입 시 사용한 이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="findpw-button">
            비밀번호 찾기
          </button>
        </form>

        <div className="findpw-footer-links">
          <a href="/login" className="findpw-link">로그인으로 돌아가기</a>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FindPasswordPage;
