// src/App.jsx
import { Routes, Route } from 'react-router-dom';

import MainPage              from './pages/MainPage';
import LoginPage             from './pages/LoginPage';
import SignupPage            from './pages/SignupPage';
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

function App() {
  return (
    <Routes>
      {/* 일반 유저 라우트 */}
      <Route path="/"                       element={<MainPage />} />
      <Route path="/login"                  element={<LoginPage />} />
      <Route path="/signup"                 element={<SignupPage />} />

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
  );
}

export default App;
