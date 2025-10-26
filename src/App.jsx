// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Header from './components/Header';
import ChatBot from './components/ChatBot';

import MainPage              from './pages/MainPage';
import AuthPage              from './pages/AuthPage';
import GameGuidePage         from './pages/GameGuidePage';
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

// 공지사항 페이지
import AnnouncementListPage  from './pages/AnnouncementListPage';
import AnnouncementDetailPage from './pages/AnnouncementDetailPage';
import AnnouncementWritePage from './pages/AnnouncementWritePage';

import MyPage                from './pages/MyPage/MyPage';
import ProfileTab            from './pages/MyPage/ProfileTab';
import EquipmentTab          from './pages/MyPage/EquipmentTab';
import ActivityTab           from './pages/MyPage/ActivityTab';
import ReportTab             from './pages/MyPage/ReportTab';
import SettingsTab           from './pages/MyPage/SettingsTab';

import AdminRoute            from './components/AdminRoute';
import AdminPage             from './adminPages/AdminPage';

// Detail 및 Create 페이지들 (각 폴더에서 개별 import)
import AdminItemDetail       from './adminPages/Item/AdminItemDetail';
import AdminItemCreate       from './adminPages/Item/AdminItemCreate';

import AdminNpcDetail        from './adminPages/Npc/AdminNpcDetail';
import AdminNpcCreate        from './adminPages/Npc/AdminNpcCreate';

import AdminSkillDetail      from './adminPages/Skill/AdminSkillDetail';
import AdminSkillCreate      from './adminPages/Skill/AdminSkillCreate';

import AdminReportDetail     from './adminPages/Report/AdminReportDetail';
import AdminAppealDetail     from './adminPages/Report/AdminAppealDetail';

import './App.css';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <Routes>
          {/* 일반 유저 라우트 */}
          <Route path="/"                       element={<MainPage />} />
          <Route path="/auth"                   element={<AuthPage />} />
          <Route path="/guide"                  element={<GameGuidePage />} />

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

          {/* 공지사항 */}
          <Route path="/announcement"           element={<AnnouncementListPage />} />
          <Route path="/announcement/new"       element={<AnnouncementWritePage />} />
          <Route path="/announcement/:id"       element={<AnnouncementDetailPage />} />
          <Route path="/announcement/:id/edit"  element={<AnnouncementWritePage />} />

          {/* 마이페이지 (로그인 필수) */}
          <Route path="/mypage" element={<MyPage />}>
            <Route index element={<Navigate to="/mypage/profile" replace />} />
            <Route path="profile" element={<ProfileTab />} />
            <Route path="equipment" element={<EquipmentTab />} />
            <Route path="activity" element={<ActivityTab />} />
            <Route path="report" element={<ReportTab />} />
            <Route path="settings" element={<SettingsTab />} />
          </Route>

          {/* 관리자 전용 라우트 */}
          <Route path="/admin" element={<AdminRoute />}>
            {/* /admin 접속 시 /admin/users로 리다이렉트 */}
            <Route index element={<Navigate to="/admin/users" replace />} />
            
            {/* 메인 관리자 페이지 (탭 전환) */}
            <Route path="users" element={<AdminPage />} />
            <Route path="items" element={<AdminPage />} />
            <Route path="npcs" element={<AdminPage />} />
            <Route path="skills" element={<AdminPage />} />
            <Route path="reports" element={<AdminPage />} />
            {/* 이의신청 탭 */}
            <Route path="appeals" element={<AdminPage />} />

            {/* 아이템 상세/생성 페이지 */}
            <Route path="items/new" element={<AdminItemCreate />} />
            <Route path="items/:id" element={<AdminItemDetail />} />

            {/* NPC 상세/생성 페이지 */}
            <Route path="npcs/new" element={<AdminNpcCreate />} />
            <Route path="npcs/:id" element={<AdminNpcDetail />} />  

            {/* Skill 상세/생성 페이지 */}
            <Route path="skills/new" element={<AdminSkillCreate />} />
            <Route path="skills/:id" element={<AdminSkillDetail />} />

            {/* Report 상세 페이지 */}
            <Route path="reports/:type/:id" element={<AdminReportDetail />} />
            
            {/* Appeal 상세 페이지 */}
            <Route path="appeals/:id" element={<AdminAppealDetail />} />
          </Route>
        </Routes>
      </main>

      {/* 모든 페이지에서 표시되는 챗봇 */}
      <ChatBot />
    </div>
  );
}

export default App;