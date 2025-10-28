// src/pages/AnnouncementDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaEye, FaThumbtack, FaTrash, FaEdit } from 'react-icons/fa';
import './AnnouncementDetailPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [announcement, setAnnouncement] = useState(null);
  const [announcementImages, setAnnouncementImages] = useState([]); // New state for images
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  // JWT에서 사용자 정보 파싱
  const [currentUserNickname, setCurrentUserNickname] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // JWT 토큰 파싱
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) return;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(json);
      const nick = decoded.nickname || decoded.username || decoded.sub;
      setCurrentUserNickname(nick);

      let role = null;
      if (decoded.role) {
        role = decoded.role.toUpperCase();
      } else if (Array.isArray(decoded.roles) && decoded.roles.length) {
        role = decoded.roles[0].split('_').pop();
      } else if (Array.isArray(decoded.authorities) && decoded.authorities.length) {
        role = decoded.authorities[0].split('_').pop();
      }
      setCurrentUserRole(role);
    } catch {
      setCurrentUserNickname(null);
      setCurrentUserRole(null);
    }
  }, []);

  // 관리자 권한 체크
  function checkAdminRole() {
    try {
      const roles = JSON.parse(localStorage.getItem('roles') || '[]');
      const isAdminRole = roles.includes('ROLE_ADMIN') || 
                          roles.includes('ADMIN') ||
                          roles.some(role => role.authority === 'ROLE_ADMIN');
      
      console.log('🔐 관리자 권한 체크:', isAdminRole);
      return isAdminRole;
    } catch {
      return false;
    }
  }

  const isAdmin = checkAdminRole();

  // 공지사항 조회
  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

    const fetchAnnouncement = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/announcements/${id}`);
      setAnnouncement(response.data);
      setIsLiked(response.data.isLiked || false);
      
      // 이미지 URL은 announcement.imageUrls에서 가져옴
      if (response.data.imageUrls && response.data.imageUrls.length > 0) {
        setAnnouncementImages(
          response.data.imageUrls.map(url => ({ filePath: url }))
        );
        console.log('이미지 URL들:', response.data.imageUrls);
      }
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다.');
      console.error(err);
    }
  };

  // 공지사항 이미지 조회
  const fetchAnnouncementImages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/announcements/${id}/images`);
      setAnnouncementImages(response.data || []);
    } catch (err) {
      console.error('공지사항 이미지를 불러오는데 실패했습니다:', err);
      // 이미지 로드 실패는 치명적이지 않으므로 에러 상태로 설정하지 않음
    }
  };

  // 좋아요
  const handleLike = async () => {
    if (!currentUserNickname) {
      alert('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/auth');
        return;
      }
      
      await axios.post(
        `${API_BASE_URL}/api/announcements/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(!isLiked);
      fetchAnnouncement();
    } catch (err) {
      console.error('좋아요 실패:', err);
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다.');
        navigate('/auth');
      }
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/auth');
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('공지사항이 삭제되었습니다.');
      navigate('/announcement');
    } catch (err) {
      console.error('삭제 실패:', err);
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다.');
        navigate('/auth');
      } else {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  // 카테고리 라벨 변환
  function getCategoryLabel(category) {
    const labels = {
      NOTICE: '공지',
      EVENT: '이벤트',
      UPDATE: '업데이트',
      MAINTENANCE: '점검'
    };
    return labels[category] || category;
  }

  // 날짜 포맷
  function formatDate(isoString) {
    const created = new Date(isoString);
    const now = new Date();
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec}초 전`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}일 전`;
    
    return created.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // 이미지 렌더링
  const renderImages = () => {
    if (!announcementImages || announcementImages.length === 0) return null;
    
    return (
      <div className="announcement-images">
        {announcementImages.map((image, index) => (
          <div key={index} className="image-container">
            <img 
              src={image.filePath} 
              alt={`공지사항 이미지 ${index + 1}`} 
              className="announcement-image" 
            />
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="detail-page">
        <div className="grain-overlay" />
        <Header />
        <div className="detail-container">
          <div className="error-message">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="detail-page">
        <div className="grain-overlay" />
        <Header />
        <div className="detail-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>공지사항을 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="grain-overlay" />
      <Header />

      <div className="detail-container">
        {/* 헤더 */}
        <div className="detail-header">
          <div className="header-content">
            <h1>공지사항</h1>
            <p>상세 보기</p>
          </div>
          <button className="btn-back-header" onClick={() => navigate('/announcement')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            목록으로
          </button>
        </div>

        {/* 공지사항 상세 */}
        <div className="post-detail-content">
          <div className="post-detail-card">
            {/* 제목 영역 */}
            <div className="title-section">
              <div className="title-badges">
                <span className={`category-badge ${announcement.category.toLowerCase()}`}>
                  {getCategoryLabel(announcement.category)}
                </span>
                {announcement.isPinned && (
                  <span className="pinned-badge">
                    <FaThumbtack /> 고정
                  </span>
                )}
              </div>
              <h2 className="post-detail-title">{announcement.title}</h2>
            </div>

            {/* 메타 정보 */}
            <div className="post-detail-meta">
              <div className="meta-left">
                <span className="meta-author">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 14C2 11.2386 4.23858 9 7 9H9C11.7614 9 14 11.2386 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {announcement.writer}
                </span>
                <span className="meta-divider">•</span>
                <span className="meta-date">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  {formatDate(announcement.createdAt)}
                </span>
              </div>
              <div className="meta-right">
                <span className="meta-views">
                  <FaEye />
                  {announcement.viewCount}
                </span>
                <span className="meta-divider">•</span>
                <span className="meta-likes">
                  <FaHeart />
                  {announcement.likeCount}
                </span>
              </div>
            </div>

            {/* 본문 */}
            <div className="post-detail-body">
              {announcement.content}
              
              {/* 이미지 렌더링 */}
              {renderImages()}
            </div>

            {/* 액션 버튼 */}
            <div className="post-actions">
              <button className={`btn-action btn-like ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                <FaHeart /> 좋아요 {announcement.likeCount}
              </button>

              {/* 관리자만 수정/삭제 가능 */}
              {isAdmin && (
                <>
                  <button className="btn-action btn-edit" onClick={() => navigate(`/announcement/${id}/edit`)}>
                    <FaEdit /> 수정
                  </button>
                  <button className="btn-action btn-delete" onClick={handleDelete}>
                    <FaTrash /> 삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}