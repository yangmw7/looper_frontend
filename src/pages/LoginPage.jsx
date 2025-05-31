// src/pages/LoginPage.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './LoginPage.css';

const LoginPage = () => {
  return (

    <div className="login-background">
        <Header />
      <div className="login-container">
        <h2 className="login-title">ID 로그인</h2>
        <input className="login-input" type="text" placeholder="ID (아이디 또는 이메일)" />
        <input className="login-input" type="password" placeholder="비밀번호" />
        <div className="login-checkbox">
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">로그인 상태 유지</label>
        </div>
        <button className="login-button">로그인</button>
        <div className="login-links">
          <a href="#">회원가입</a>
          <a href="#">ID 찾기</a>
          <a href="#">비밀번호 찾기</a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
