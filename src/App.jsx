// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// ID 찾기 관련
import FindIDPage from './pages/FindIDPage';
import ShowIDPage from './pages/ShowIDPage';
import FailIDPage from './pages/FailIDPage';

// 비밀번호 찾기(1단계: 아이디+이메일 확인)
import FindPasswordPage from './pages/FindPasswordPage';
// 비밀번호 재설정 폼 (2단계)
import ResetPasswordPage from './pages/ResetPasswordPage';
// 비밀번호 찾기 실패 화면
import FailPasswordPage from './pages/FailPasswordPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* ID 찾기 */}
      <Route path="/find-id" element={<FindIDPage />} />
      <Route path="/find-id/success" element={<ShowIDPage />} />
      <Route path="/find-id/fail" element={<FailIDPage />} />

      {/* 비밀번호 찾기(1단계) */}
      <Route path="/find-password" element={<FindPasswordPage />} />
      {/* 비밀번호 재설정(2단계) */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* 비밀번호 찾기 실패 */}
      <Route path="/find-password/fail" element={<FailPasswordPage />} />
    </Routes>
  );
}

export default App;
