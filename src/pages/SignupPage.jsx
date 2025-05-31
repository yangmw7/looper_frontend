// SignupPage.jsx
import React from 'react';
import './SignupPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function SignupPage() {
  return (
    <div className="signup-page">
      {/* Header 컴포넌트 (고정된 네비게이션 바) */}
      <Header />

      {/* 회원가입 컨테이너 */}
      <div className="signup-container">
        {/* 로고 + 서브타이틀 */}
        <div className="signup-header">
          <h1 className="logo">looper</h1>
          <p className="subtitle">회원가입</p>
        </div>

        {/* 계정정보 폼 */}
        <div className="account-info">
          <h2>계정정보</h2>
          <form>
            {/* Email Field with Validation Message */}
            <div className="form-group">
              <p className="validation-text">이메일은 반드시 입력하셔야 합니다.</p>
              <p className="example-text">예) name@example.com</p>
              <input
                type="email"
                className="input input-error"
                placeholder=""
              />
            </div>

            {/* 아이디 Field */}
            <div className="form-group">
              <input
                type="text"
                className="input"
                placeholder="아이디"
              />
            </div>

            {/* 닉네임 Field */}
            <div className="form-group">
              <input
                type="text"
                className="input"
                placeholder="닉네임"
              />
            </div>

            {/* 비밀번호 Field */}
            <div className="form-group">
              <input
                type="password"
                className="input"
                placeholder="비밀번호"
              />
            </div>

            {/* 비밀번호 재확인 Field */}
            <div className="form-group">
              <input
                type="password"
                className="input"
                placeholder="비밀번호 재확인"
              />
            </div>

            {/* 회원가입 버튼 */}
            <div className="button-group">
              <button type="submit" className="signup-button">
                회원가입
              </button>
            </div>
          </form>
        </div>
      </div>
        <footer className="footer">
        © 2025 Looper Game Team. All Rights Reserved.<br />
        개발자: 양민우 & Looper 팀 | 문의: looperteam@example.com
      </footer>
      
    </div>
    
    
  );
}

export default SignupPage;
