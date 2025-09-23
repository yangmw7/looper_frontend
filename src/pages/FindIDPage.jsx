// src/pages/FindIDPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './FindIDPage.css';

const FindIDPage = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 백엔드에 { email } 형태로 POST 요청
      const response = await axios.post(
        '/find-id',
        { email: email }
      );

      // 백엔드가 반환한 JSON 예시:
      // 성공: { username: "찾은아이디" }
      // 실패: { error: "해당 이메일로 가입된 계정이 없습니다." }
      const data = response.data;

      if (data.username) {
        // 아이디(Username)를 찾았다면, /find-id/success 경로로 이동하면서
        // state에 username을 전달
        navigate('/find-id/success', {
          state: { username: data.username }
        });
      } else {
        // error 필드가 있을 경우: /find-id/fail 경로로 이동하면서
        // state에 errorMessage를 전달
        navigate('/find-id/fail', {
          state: { errorMessage: data.error }
        });
      }
    } catch (err) {
      // 네트워크 오류나 서버 오류 등
      console.error(err);
      navigate('/find-id/fail', {
        state: { errorMessage: '서버에 연결할 수 없습니다.' }
      });
    }
  };

  return (
    <div className="findid-background">
      {/* 상단 Header */}
      <Header />

      {/* 메인 컨텐츠 박스 */}
      <div className="findid-box">
        <h2 className="findid-title">ID 찾기</h2>
        <form onSubmit={handleSubmit} className="findid-form">
          <label htmlFor="email" className="findid-label">이메일</label>
          <input
            type="email"
            id="email"
            className="findid-input"
            placeholder="가입 시 사용한 이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="findid-button">
            ID 찾기
          </button>
        </form>

        <div className="findid-footer-links">
          <a href="/login" className="findid-link">로그인으로 돌아가기</a>
        </div>
      </div>

      {/* 하단 Footer */}
      <Footer />
    </div>
  );
};

export default FindIDPage;
