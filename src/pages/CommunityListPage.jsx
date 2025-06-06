// src/pages/CommunityListPage.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CommunityListPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CommunityListPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  // ──────────────────────────────────────────────────────
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    // 백엔드에서 게시글 목록 가져오기 (인증 필요 없는 공개 API)
    axios
      .get('http://localhost:8080/api/posts')
      .then((response) => {
        // 1) 원본 데이터를 createdAt(ISO) 기준으로 내림차순 정렬
        const sortedByDate = response.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // 2) 정렬된 결과를 map 하여 화면에 필요한 형태로 가공
        const apiPosts = sortedByDate.map((p) => ({
          id: p.id,
          title: p.title,
          author: p.writer,       // writer → author
          comments: 0,            // TODO: 댓글 API 연동 시 교체
          views: p.viewCount,
          createdAt: formatDate(p.createdAt), // “n초 전 / n분 전 / n시간 전 / n일 전” 형식
        }));

        setPosts(apiPosts);
      })
      .catch((err) => {
        console.error('게시글 목록 조회 실패:', err);
        setError('게시글을 불러오는 중 오류가 발생했습니다.');
      });
  }, []);

  // ISO 문자열 → “n초 전 / n분 전 / n시간 전 / n일 전” 로 간단 포맷팅
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

  // ──────────────────────────────────────────────────────
  // 페이징 로직
  const indexOfLastPost = currentPage * postsPerPage;            // 예: 1페이지면 1*10=10
  const indexOfFirstPost = indexOfLastPost - postsPerPage;       // 예: 10-10=0
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : totalPages));
  };

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

        <div className="post-table">
          {/* 그리드 헤더 (눈에는 보이지 않지만 칼럼 너비를 잡기 위해 남겨둡니다). */}
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
                {/* 1) 제목 */}
                <a href={`/community/${post.id}`} className="col-title">
                  {post.title}
                </a>

                {/* 2) 작성자 */}
                <span className="col-author">{post.author}</span>

                {/* 3) 댓글(더미) */}
                <span className="col-comments">💬 {post.comments}</span>

                {/* 4) 조회수 */}
                <span className="col-views">👁️ {post.views}</span>

                {/* 5) 작성일 */}
                <span className="col-date">{post.createdAt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 페이지네이션 + 글쓰기 버튼을 같은 줄에 */}
        <div className="pagination-wrapper">
          <div className="pagination">
            {/* 이전 버튼 */}
            <button
              className="page-button prev-button"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {/* 페이지 번호 */}
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((num) => (
              <button
                key={num}
                className={`page-button ${currentPage === num ? 'active' : ''}`}
                onClick={() => handlePageClick(num)}
              >
                {num}
              </button>
            ))}

            {/* 다음 버튼 */}
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
