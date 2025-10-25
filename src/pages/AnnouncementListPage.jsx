// src/pages/AnnouncementListPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaEye, FaThumbtack } from 'react-icons/fa';
import './AnnouncementListPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AnnouncementListPage() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  const postsPerPage = 15;

  // 관리자 권한 체크
  function checkAdminRole() {
    try {
      const roles = JSON.parse(localStorage.getItem('roles') || '[]');
      return roles.includes('ROLE_ADMIN') || 
             roles.includes('ADMIN') ||
             roles.some(role => role.authority === 'ROLE_ADMIN');
    } catch {
      return false;
    }
  }

  const isAdmin = checkAdminRole();

  // 공지사항 목록 조회
  useEffect(() => {
    fetchAnnouncements();
  }, [activeCategory, currentPage]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: postsPerPage
      };
      
      if (activeCategory !== 'ALL') {
        params.category = activeCategory;
      }

      const response = await axios.get(`${API_BASE_URL}/api/announcements`, { params });
      
      const apiAnnouncements = response.data.content.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        categoryLabel: getCategoryLabel(a.category),
        author: a.writer,
        views: a.viewCount,
        likes: a.likeCount,
        isPinned: a.isPinned,
        createdAt: formatDate(a.createdAt)
      }));

      setAnnouncements(apiAnnouncements);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      console.error('공지사항 목록 조회 실패:', err);
      setError('공지사항을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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

  // 카테고리 변경
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  // 페이지 이동
  const handlePageClick = (num) => setCurrentPage(num);
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // 페이지네이션 번호 계산
  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="announcement-page">
      <div className="grain-overlay" />
      <Header />

      <div className="announcement-container">
        {/* 헤더 */}
        <div className="announcement-header">
          <div className="header-content">
            <h1>공지사항</h1>
            <p>중요한 소식과 업데이트를 확인하세요</p>
          </div>
          {isAdmin && (
            <button 
              className="write-btn-header"
              onClick={() => navigate('/announcement/new')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              공지 작성
            </button>
          )}
        </div>

        {/* 컨텐츠 */}
        <div className="announcement-content">
          {/* 카테고리 탭 */}
          <div className="content-top">
            <div className="category-tabs">
              <button
                className={activeCategory === 'ALL' ? 'active' : ''}
                onClick={() => handleCategoryChange('ALL')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2H14V14H2V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M5 6H11M5 9H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                전체
              </button>
              <button
                className={activeCategory === 'NOTICE' ? 'active' : ''}
                onClick={() => handleCategoryChange('NOTICE')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L9.5 6H14L10.5 9L12 13L8 10L4 13L5.5 9L2 6H6.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                공지
              </button>
              <button
                className={activeCategory === 'EVENT' ? 'active' : ''}
                onClick={() => handleCategoryChange('EVENT')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                이벤트
              </button>
              <button
                className={activeCategory === 'UPDATE' ? 'active' : ''}
                onClick={() => handleCategoryChange('UPDATE')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2V8M8 8L11 11M8 8L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                업데이트
              </button>
              <button
                className={activeCategory === 'MAINTENANCE' ? 'active' : ''}
                onClick={() => handleCategoryChange('MAINTENANCE')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 6V8M8 10V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3 14L8 2L13 14H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                점검
              </button>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="error-msg">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6V10M10 13V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* 로딩 상태 */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>공지사항을 불러오는 중...</p>
            </div>
          ) : (
            <>
              {/* 공지사항 테이블 */}
              <div className="announcements-table">
                <div className="table-header">
                  <span className="col-title">제목</span>
                  <span className="col-author">작성자</span>
                  <span className="col-stats">반응</span>
                  <span className="col-date">작성일</span>
                </div>

                <div className="table-body">
                  {announcements.length > 0 ? (
                    announcements.map((post) => (
                      <div
                        key={post.id}
                        className={`announcement-row ${post.isPinned ? 'pinned' : ''}`}
                        onClick={() => navigate(`/announcement/${post.id}`)}
                      >
                        <div className="col-title">
                          {post.isPinned && (
                            <span className="pin-icon">
                              <FaThumbtack />
                            </span>
                          )}
                          <span className={`category-badge ${post.category.toLowerCase()}`}>
                            {post.categoryLabel}
                          </span>
                          <span className="announcement-title-text">{post.title}</span>
                        </div>
                        <span className="col-author">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M2 12C2 9.79086 3.79086 8 6 8H8C10.2091 8 12 9.79086 12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          {post.author}
                        </span>
                        <span className="col-stats">
                          <span className="stat-item">
                            <FaEye />
                            {post.views}
                          </span>
                          <span className="stat-item">
                            <FaHeart />
                            {post.likes}
                          </span>
                        </span>
                        <span className="col-date">{post.createdAt}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                        <rect x="12" y="12" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2"/>
                        <path d="M20 28H44M20 36H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <p>공지사항이 없습니다</p>
                      <span>첫 번째 공지사항을 작성해보세요!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 0 && (
                <div className="pagination">
                  <button 
                    onClick={handlePrev} 
                    disabled={currentPage === 1}
                    className="page-nav"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {currentPage > 3 && (
                    <>
                      <button onClick={() => handlePageClick(1)}>1</button>
                      {currentPage > 4 && <span className="page-ellipsis">...</span>}
                    </>
                  )}
                  
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      className={currentPage === pageNum ? 'active' : ''}
                      onClick={() => handlePageClick(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="page-ellipsis">...</span>}
                      <button onClick={() => handlePageClick(totalPages)}>{totalPages}</button>
                    </>
                  )}
                  
                  <button 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages}
                    className="page-nav"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
