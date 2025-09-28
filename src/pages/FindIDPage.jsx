// src/pages/FindIDPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './FindIDPage.css';

const FindIDPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 백엔드에 { email } 형태로 POST 요청
      const response = await axios.post('/find-id', { email });

      const data = response.data;

      if (data.username) {
        // 성공 → Success 페이지 이동
        navigate('/find-id/success', {
          state: { username: data.username },
        });
      } else {
        // 실패 → Fail 페이지 이동
        navigate('/find-id/fail', {
          state: { errorMessage: data.error },
        });
      }
    } catch (err) {
      console.error(err);
      navigate('/find-id/fail', {
        state: { errorMessage: '서버에 연결할 수 없습니다.' },
      });
    }
  };

  return (
    <div className="findid-background">
      {/* 상단 Header */}
      <Header />

      {/* 메인 컨텐츠 */}
      <div className="findid-container">
        <div className="findid-box">
          <h2 className="findid-title">ID 찾기</h2>
          <form onSubmit={handleSubmit} className="findid-form">
            <label htmlFor="email" className="findid-label">
              이메일
            </label>
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
            <a href="/login" className="findid-link">
              로그인으로 돌아가기
            </a>
          </div>
        </div>
      </div>

      {/* 하단 Footer */}
      <Footer />
    </div>
  );
};

export default FindIDPage;
