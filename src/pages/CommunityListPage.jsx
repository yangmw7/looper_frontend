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
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('recent');
  const postsPerPage = 15;

  const [searchField, setSearchField] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
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
          createdAt: formatDate(p.createdAt),
        }));
        setPosts(apiPosts);
      })
      .catch((err) => {
        console.error('게시글 목록 조회 실패:', err);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      });
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
    return created.toLocaleDateString();
  }

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const fieldValue = String(post[searchField] || '').toLowerCase();
    return fieldValue.includes(searchQuery.trim().toLowerCase());
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (activeTab === 'popular') {
      return (b.views + b.comments * 10) - (a.views + a.comments * 10);
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

  return (
    <div className="community-page">
      <div className="grain-overlay" />
      <Header />

      <div className="community-container">
        <div className="community-header">
          <h1>커뮤니티</h1>
          <p>게임 이야기를 나누는 공간</p>
        </div>

        <div className="community-content">
          <div className="content-top">
            <div className="tabs">
              <button
                className={activeTab === 'recent' ? 'active' : ''}
                onClick={() => handleTabChange('recent')}
              >
                최근 글
              </button>
              <button
                className={activeTab === 'popular' ? 'active' : ''}
                onClick={() => handleTabChange('popular')}
              >
                인기 글
              </button>
            </div>

            <div className="actions">
              <div className="search">
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                >
                  <option value="title">제목</option>
                  <option value="author">작성자</option>
                </select>
                <input
                  type="text"
                  placeholder="검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
                />
              </div>
              <button 
                className="write-btn"
                onClick={() => navigate('/community/new')}
              >
                글쓰기
              </button>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="posts-table">
            <div className="table-header">
              <span className="col-title">제목</span>
              <span className="col-author">작성자</span>
              <span className="col-views">조회</span>
              <span className="col-date">날짜</span>
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
                      {post.title}
                      {post.comments > 0 && (
                        <span className="comment-count">[{post.comments}]</span>
                      )}
                    </div>
                    <span className="col-author">{post.author}</span>
                    <span className="col-views">{post.views}</span>
                    <span className="col-date">{post.createdAt}</span>
                  </div>
                ))
              ) : (
                <div className="empty">게시글이 없습니다</div>
              )}
            </div>
          </div>

          {totalPages > 0 && (
            <div className="pagination">
              <button onClick={handlePrev} disabled={currentPage === 1}>
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    className={currentPage === pageNum ? 'active' : ''}
                    onClick={() => handlePageClick(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={handleNext} disabled={currentPage === totalPages}>
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}