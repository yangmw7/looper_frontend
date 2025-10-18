// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell, FaUser } from 'react-icons/fa';
import logo from '../assets/looper_logo.png';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [nickname, setNickname] = useState(null);
  const [roles, setRoles] = useState([]);
  
  // 알림 상태
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // 토큰에서 사용자 정보 디코딩
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    if (!token) {
      setNickname(null);
      setRoles([]);
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      setNickname(payload.nickname || payload.sub || payload.username);
      setRoles(payload.roles || []);
    } catch (e) {
      console.error('JWT 디코딩 실패:', e);
      setNickname(null);
      setRoles([]);
    }
  }, []);

  // 알림 데이터 가져오기
  useEffect(() => {
    if (nickname) {
      fetchNotifications();
      fetchUnreadCount();
      
      // 30초마다 알림 갱신
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [nickname]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 알림 목록 조회
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('알림 조회 실패:', err);
    }
  };

  // 읽지 않은 알림 개수 조회
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('알림 개수 조회 실패:', err);
    }
  };

  // 알림 읽음 처리
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      await axios.post(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      await axios.post(`${API_BASE_URL}/api/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('전체 읽음 처리 실패:', err);
    }
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setShowNotifications(false);
    // 알림 타입에 따라 페이지 이동
    // navigate('/community'); 등
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      const token =
        localStorage.getItem('accessToken') ||
        sessionStorage.getItem('accessToken');

      if (!token) {
        alert('이미 로그아웃 상태입니다.');
        return;
      }

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      const username = payload.sub || payload.username;

      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('nickname');
      localStorage.removeItem('roles');

      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      delete axios.defaults.headers.common['Authorization'];

      alert('로그아웃 완료');
      navigate('/');
      setNickname(null);
      setRoles([]);
    } catch (err) {
      console.error('로그아웃 실패:', err);
      alert('로그아웃 실패');
    }
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img src={logo} alt="Looper Logo" className="header-logo" />
        </Link>
        <Link to="/">홈</Link>
        <Link to="/guide">게임 정보</Link>
        <Link to="/announcement">공지사항</Link>
        <Link to="/community">커뮤니티</Link>
      </div>

      <div className="nav-right">
        {nickname ? (
          <>
            {/* 알림 아이콘 */}
            <div className="notification-wrapper" ref={notificationRef}>
              <button 
                className="icon-button notification-icon"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
              >
                <FaBell size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* 알림 드롭다운 */}
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>알림</h3>
                    {unreadCount > 0 && (
                      <button 
                        className="mark-all-read-btn"
                        onClick={markAllAsRead}
                      >
                        모두 읽음
                      </button>
                    )}
                  </div>
                  
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-content">
                            <p className="notification-message">{notification.message}</p>
                            <span className="notification-time">
                              {new Date(notification.createdAt).toLocaleString('ko-KR')}
                            </span>
                          </div>
                          {!notification.isRead && <div className="unread-dot" />}
                        </div>
                      ))
                    ) : (
                      <div className="empty-notifications">
                        <p>알림이 없습니다</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 사용자 메뉴 */}
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button 
                className="icon-button user-icon"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
              >
                <FaUser size={18} />
              </button>

              {/* 사용자 드롭다운 */}
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar">
                      <FaUser size={24} />
                    </div>
                    <div className="user-details">
                      <p className="user-nickname">{nickname}</p>
                      <p className="user-role">
                        {roles.includes('ADMIN') ? '관리자' : '사용자'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="user-menu-divider" />
                  
                  <div className="user-menu-items">
                    {roles.includes('ADMIN') ? (
                      <Link 
                        to="/admin" 
                        className="user-menu-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        관리자 페이지
                      </Link>
                    ) : (
                      <Link 
                        to="/mypage" 
                        className="user-menu-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        마이 페이지
                      </Link>
                    )}
                    
                    <button 
                      className="user-menu-item logout-item"
                      onClick={handleLogout}
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/auth" className="login-link">로그인 / 회원가입</Link>
        )}
      </div>
    </header>
  );
}

export default Header;