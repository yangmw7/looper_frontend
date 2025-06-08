// src/pages/CommunityListPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CommunityListPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CommunityListPage() {
  const [posts, setPosts]       = useState([]);
  const [error, setError]       = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // ─── 검색 상태 ─────────────────────────
  const [searchField, setSearchField] = useState('title');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/posts')
      .then((response) => {
        // 'commentCount' 필드 기준으로도 이미 내려오지만, 
        // 최근 글(tab)이니까 createdAt 으로 정렬합니다.
        const sortedByDate = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const apiPosts = sortedByDate.map((p) => ({
          id: p.id,
          title: p.title,
          author: p.writer,
          comments: p.commentCount,    // 백엔드에서 내려주는 실제 댓글 수
          views: p.viewCount,
          createdAt: formatDate(p.createdAt),
        }));
        setPosts(apiPosts);
      })
      .catch((err) => {
        console.error('게시글 목록 조회 실패:', err);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      });
  }, []);

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
    return `${diffDay}일 전`;
  }

  // ─── 검색 & 필터링 ───────────────────────
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;
    const fieldValue = String(post[searchField] || '').toLowerCase();
    return fieldValue.includes(searchQuery.trim().toLowerCase());
  });

  // ─── 페이징 로직 ─────────────────────────
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const idxLast  = currentPage * postsPerPage;
  const idxFirst = idxLast - postsPerPage;
  const currentPosts = filteredPosts.slice(idxFirst, idxLast);

  const handlePageClick = (num) => setCurrentPage(num);
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="community-background">
      <Header />

      <div className="community-list-page">
        <h2 className="community-title">커뮤니티</h2>
        <div className="tab-menu">
          <span className="tab">카테고리</span>
          <span className="tab">인기 글</span>
          <span className="tab active">최근 글</span>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* ─── 검색 바 ───────────────────────── */}
        <div className="community-search">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="title">제목</option>
            <option value="author">작성자</option>
          </select>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
          />
          <button onClick={() => setCurrentPage(1)}>검색</button>
        </div>

        <div className="post-table">
          <div className="post-header">
            <span className="col-title">제목</span>
            <span className="col-author">작성자</span>
            <span className="col-comments">댓글</span>
            <span className="col-views">조회</span>
            <span className="col-date">날짜</span>
          </div>

          <ul className="post-list">
            {currentPosts.map((post) => (
              <li key={post.id} className="post-row">
                <a href={`/community/${post.id}`} className="col-title">
                  {post.title}
                </a>
                <span className="col-author">{post.author}</span>
                <span className="col-comments">💬 {post.comments}</span>
                <span className="col-views">👁️ {post.views}</span>
                <span className="col-date">{post.createdAt}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pagination-wrapper">
          <div className="pagination">
            <button
              className="page-button prev-button"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`page-button ${currentPage === num ? 'active' : ''}`}
                onClick={() => handlePageClick(num)}
              >
                {num}
              </button>
            ))}
            <button
              className="page-button next-button"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>

          <a href="/community/new" className="new-post-button">
            글쓰기
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
