// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import MainPage              from './pages/MainPage';
import AuthPage              from './pages/AuthPage'; // 새로운 통합 페이지
import FindIDPage            from './pages/FindIDPage';
import ShowIDPage            from './pages/ShowIDPage';
import FailIDPage            from './pages/FailIDPage';
import FindPasswordPage      from './pages/FindPasswordPage';
import ResetPasswordPage     from './pages/ResetPasswordPage';
import FailPasswordPage      from './pages/FailPasswordPage';
import CommunityListPage     from './pages/CommunityListPage';
import CommunityDetailPage   from './pages/CommunityDetailPage';
import CommunityCreatePage   from './pages/CommunityCreatePage';
import CommunityEditPage     from './pages/CommunityEditPage';

import AdminRoute            from './components/AdminRoute';
import AdminUserList         from './adminPages/AdminUserList';

import ChatWidget from './components/ChatWidget';
import ChatWidgetButton from './components/ChatWidgetButton';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 라우트 */}
      <Routes>
        {/* 일반 유저 라우트 */}
        <Route path="/"                       element={<MainPage />} />
        <Route path="/login"                  element={<AuthPage />} />
        <Route path="/signup"                 element={<AuthPage />} />

        {/* ID 찾기 */}
        <Route path="/find-id"                element={<FindIDPage />} />
        <Route path="/find-id/success"        element={<ShowIDPage />} />
        <Route path="/find-id/fail"           element={<FailIDPage />} />

        {/* 비밀번호 찾기 */}
        <Route path="/find-password"          element={<FindPasswordPage />} />
        <Route path="/reset-password"         element={<ResetPasswordPage />} />
        <Route path="/find-password/fail"     element={<FailPasswordPage />} />

        {/* 커뮤니티 */}
        <Route path="/community"              element={<CommunityListPage />} />
        <Route path="/community/new"          element={<CommunityCreatePage />} />
        <Route path="/community/:id"          element={<CommunityDetailPage />} />
        <Route path="/community/:id/edit"     element={<CommunityEditPage />} />

        {/* 관리자 전용 라우트 */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminUserList />} />
        </Route>
      </Routes>

      {/* 챗봇 위젯 (모든 페이지에서 항상 표시됨) */}
      {open && <ChatWidget onClose={() => setOpen(false)} />}
      <ChatWidgetButton onToggle={() => setOpen(!open)} />
    </>
  );
}

export default App;