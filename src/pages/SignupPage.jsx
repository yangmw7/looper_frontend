// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function SignupPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    username: '',
    nickname: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const payload = {
        email: form.email,
        username: form.username,
        nickname: form.nickname,
        password: form.password
      };
      const response = await axios.post(
        `${API_BASE_URL}/api/join`,
        payload
      );
      const message = response.data; // 백엔드에서 넘어온 순수 문자열

      if (message === '회원가입 성공') {
        alert(message);
        navigate('/login');
      } else {
        // “이미 있는 이메일입니다.” 또는 “이미 있는 아이디입니다.” 등
        alert(message);
      }
    } catch (err) {
      alert('서버에 연결할 수 없습니다.');
    }
  };

  return (
    <div className="signup-page">
      <Header />

      <div className="signup-container">
        <div className="signup-header">
          <h1 className="logo">looper</h1>
          <p className="subtitle">회원가입</p>
        </div>

        <div className="account-info">
          <h2>계정정보</h2>
          <form onSubmit={handleSubmit}>
            {/* 이메일 입력 */}
            <div className="form-group">
              <p className="validation-text">이메일은 반드시 입력하셔야 합니다.</p>
              <p className="example-text">예) name@example.com</p>
              <input
                type="email"
                name="email"
                className="input input-error"
                placeholder=""
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* 아이디 입력 */}
            <div className="form-group">
              <input
                type="text"
                name="username"
                className="input"
                placeholder="아이디"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* 닉네임 입력 */}
            <div className="form-group">
              <input
                type="text"
                name="nickname"
                className="input"
                placeholder="닉네임"
                value={form.nickname}
                onChange={handleChange}
                required
              />
            </div>

            {/* 비밀번호 입력 */}
            <div className="form-group">
              <input
                type="password"
                name="password"
                className="input"
                placeholder="비밀번호"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* 비밀번호 재확인 입력 */}
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                className="input"
                placeholder="비밀번호 재확인"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {/* 회원가입 버튼 */}
            <div className="button-group">
              <button type="submit" className="signup-button">
                회원가입
              </button>
            </div>

            {/* ↓ 여기서부터 로그인으로 돌아가기 링크 추가 ↓ */}
            <div className="signup-footer-links">
              <a href="/login">로그인으로 돌아가기</a>
            </div>
            {/* ↑ 추가 끝 ↑ */}
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default SignupPage;
