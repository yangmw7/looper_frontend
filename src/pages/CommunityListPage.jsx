// src/pages/CommunityListPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CommunityListPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CommunityListPage() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('recent');
  const postsPerPage = 15;

  const [searchField, setSearchField] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/posts`)
      .then((response) => {
        const sortedByDate = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const apiPosts = sortedByDate.map((p) => ({
          id: p.id,
          title: p.title,
          author: p.writer,
          comments: p.commentCount,
          views: p.viewCount,
          likes: p.likeCount,
          createdAt: formatDate(p.createdAt),
        }));
        setPosts(apiPosts);
      })
      .catch((err) => {
        console.error('게시글 목록 조회 실패:', err);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      })
      .finally(() => setLoading(false));
  }, [API_BASE_URL]);

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

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const fieldValue = String(post[searchField] || '').toLowerCase();
    return fieldValue.includes(searchQuery.trim().toLowerCase());
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeTab === 'popular') {
      return (b.views + b.comments * 10 + b.likes * 5) - (a.views + a.comments * 10 + a.likes * 5);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const idxLast = currentPage * postsPerPage;
  const idxFirst = idxLast - postsPerPage;
  const currentPosts = sortedPosts.slice(idxFirst, idxLast);

  const handlePageClick = (num) => setCurrentPage(num);
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

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
    <div className="community-page">
      <div className="grain-overlay" />
      <Header />

      <div className="community-container">
        <div className="community-header">
          <div className="header-content">
            <h1>커뮤니티</h1>
            <p>게임 이야기를 나누는 공간</p>
          </div>
          <button 
            className="write-btn-header"
            onClick={() => navigate('/community/new')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            글쓰기
          </button>
        </div>

        <div className="community-content">
          <div className="content-top">
            <div className="tabs">
              <button
                className={activeTab === 'recent' ? 'active' : ''}
                onClick={() => handleTabChange('recent')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                최신순
              </button>
              <button
                className={activeTab === 'popular' ? 'active' : ''}
                onClick={() => handleTabChange('popular')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L9.5 6.5H14L10.5 9.5L12 14L8 11L4 14L5.5 9.5L2 6.5H6.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                인기순
              </button>
            </div>

            <div className="search-area">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="search-select"
              >
                <option value="title">제목</option>
                <option value="author">작성자</option>
              </select>
              <div className="search-input-wrapper">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="error-msg">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 6V10M10 13V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>게시글을 불러오는 중...</p>
            </div>
          ) : (
            <>
              <div className="posts-table">
                <div className="table-header">
                  <span className="col-title">제목</span>
                  <span className="col-author">작성자</span>
                  <span className="col-stats">반응</span>
                  <span className="col-date">작성일</span>
                </div>

                <div className="table-body">
                  {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                      <div
                        key={post.id}
                        className="post-row"
                        onClick={() => navigate(`/community/${post.id}`)}
                      >
                        <div className="col-title">
                          <span className="post-title-text">{post.title}</span>
                          {post.comments > 0 && (
                            <span className="comment-badge">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 2H12V9H7L4 12V9H2V2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                              </svg>
                              {post.comments}
                            </span>
                          )}
                        </div>
                        <span className="col-author">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M2 12C2 9.79086 3.79086 8 6 8H8C10.2091 8 12 9.79086 12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          {post.author}
                        </span>
                        <span className="col-stats">
                          {/* 조회수 */}
                          <span className="stat-item">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M1 7C1 7 3 3 7 3C11 3 13 7 13 7C13 7 11 11 7 11C3 11 1 7 1 7Z" stroke="currentColor" strokeWidth="1.2"/>
                              <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/>
                            </svg>
                            {post.views}
                          </span>
                          {/* ⭐ 댓글 수 */}
                          <span className="stat-item">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M2 2H12V9H7L4 12V9H2V2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
                            {post.comments}
                          </span>
                          {/* ⭐ 좋아요 수 */}
                          <span className="stat-item">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M7 12L2.5 7.5C1.5 6.5 1.5 4.5 2.5 3.5C3.5 2.5 5.5 2.5 6.5 3.5L7 4L7.5 3.5C8.5 2.5 10.5 2.5 11.5 3.5C12.5 4.5 12.5 6.5 11.5 7.5L7 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
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
                      <p>게시글이 없습니다</p>
                      <span>첫 번째 글을 작성해보세요!</span>
                    </div>
                  )}
                </div>
              </div>

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