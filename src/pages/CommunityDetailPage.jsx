// src/pages/CommunityDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CommunityDetailPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 게시물 데이터
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  // 댓글 목록
  const [comments, setComments] = useState([]);
  const [commentsError, setCommentsError] = useState(null);

  // 새 댓글 입력 값
  const [newComment, setNewComment] = useState('');

  // 현재 로그인한 사용자의 닉네임 (토큰에서 꺼냄)
  const [currentUserNickname, setCurrentUserNickname] = useState(null);

  // ──────────────────────────────────────────────────────
  // 0) JWT 토큰에서 현재 사용자의 닉네임 추출
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    if (!token) {
      setCurrentUserNickname(null);
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);

      // 백엔드가 nickname 클레임에 닉네임을 넣었다고 가정
      const nicknameFromToken = decoded.nickname || decoded.username || decoded.sub;
      setCurrentUserNickname(nicknameFromToken);
    } catch (e) {
      console.error('토큰 디코딩 실패:', e);
      setCurrentUserNickname(null);
    }
  }, []);

  // ──────────────────────────────────────────────────────
  // 1) 게시물 상세 조회
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/posts/${id}`)
      .then((response) => {
        const data = response.data;
        setPost({
          id: data.id,
          title: data.title,
          content: data.content,
          // 여기서 writerNickname 대신 writer 로 가져와야 합니다.
          author: data.writer,
          views: data.viewCount,
          createdAt: formatDate(data.createdAt),
        });
      })
      .catch((err) => {
        console.error('게시물 상세 조회 실패:', err);
        setError('게시물을 불러오는 중 오류가 발생했습니다.');
      });
  }, [id]);

  // ──────────────────────────────────────────────────────
  // 2) 댓글 목록 조회
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/posts/${id}/comments`)
      .then((response) => {
        // response.data는 Comment 객체 배열: { id, content, writerNickname, createdAt }
        const apiComments = response.data.map((c) => ({
          id: c.id,
          content: c.content,
          author: c.writerNickname, 
          createdAt: formatDate(c.createdAt),
        }));
        setComments(apiComments);
      })
      .catch((err) => {
        console.error('댓글 목록 조회 실패:', err);
        setCommentsError('댓글을 불러오는 중 오류가 발생했습니다.');
      });
  }, [id]);

  // 날짜 포맷팅 함수 (게시물/댓글 공용)
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
    if (diffDay < 30) return `${diffDay}일 전`;
    return created.toLocaleDateString();
  }

  // ──────────────────────────────────────────────────────
  // 뒤로가기
  const handleBack = () => {
    navigate('/community');
  };

  // 수정
  const handleEdit = () => {
    navigate(`/community/${id}/edit`);
  };

  // 삭제
  const handleDelete = () => {
    if (!window.confirm('정말 이 게시물을 삭제하시겠습니까?')) return;

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    axios
      .delete(`http://localhost:8080/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert('게시물이 삭제되었습니다.');
        navigate('/community');
      })
      .catch((err) => {
        console.error('게시물 삭제 실패:', err);
        alert('게시물을 삭제하는 도중 오류가 발생했습니다.');
      });
  };

  // ──────────────────────────────────────────────────────
  // 3) 새 댓글 작성 핸들러
  const handleCommentSubmit = () => {
    if (!newComment.trim()) return; // 빈 댓글 막기

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    axios
      .post(
        `http://localhost:8080/api/posts/${id}/comments`,
        { content: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        // 저장된 댓글을 곧바로 목록에 추가 (Optimistic Update)
        const saved = response.data; // { id, content, writerNickname, createdAt, ... }

        const nicknameFromSaved = saved.writerNickname || saved.nickname;

        const newlyAdded = {
          id: saved.id,
          content: saved.content,
          author: nicknameFromSaved,
          createdAt: formatDate(saved.createdAt),
        };

        setComments((prev) => [newlyAdded, ...prev]);
        setNewComment(''); // 입력창 비우기
      })
      .catch((err) => {
        console.error('댓글 작성 실패:', err);
        alert('댓글 등록 중 오류가 발생했습니다.');
      });
  };

  return (
    <div className="community-background">
      <Header />

      <div className="community-detail-page">
        <h2 className="detail-title">커뮤니티</h2>
        <div className="detail-subtitle">게시물 상세 보기</div>

        {error && <div className="error-message">{error}</div>}

        {!post ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <div className="detail-container">
            {/* =====================  게시물 영역  ===================== */}
            <h3 className="post-title">{post.title}</h3>

            <div className="post-meta">
              {/* “작성자:” 텍스트 제거, 아이콘+닉네임만 표시 */}
              <span className="meta-author">{post.author}</span>
              <span className="meta-views">{post.views}</span>
              <span className="meta-date">{post.createdAt}</span>
            </div>

            <div className="post-content">{post.content}</div>

            <div className="button-group">
              <button className="btn-back" onClick={handleBack}>
                목록으로
              </button>
              {/* 포스트 작성자와 현재 유저가 일치하는 경우에만 수정/삭제 버튼 보이기 */}
              {currentUserNickname && post.author && currentUserNickname === post.author && (
                <>
                  <button className="btn-edit" onClick={handleEdit}>
                    수정
                  </button>
                  <button className="btn-delete" onClick={handleDelete}>
                    삭제
                  </button>
                </>
              )}
            </div>

            {/* =====================  댓글 입력 영역  ===================== */}
            {currentUserNickname ? (
              <div className="comment-input-container">
                <textarea
                  className="comment-input"
                  placeholder="댓글을 입력하세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  className="btn-comment-submit"
                  onClick={handleCommentSubmit}
                  disabled={!newComment.trim()}
                >
                  댓글 등록
                </button>
              </div>
            ) : (
              <div className="comment-login-prompt">
                댓글을 작성하려면 로그인해주세요.
              </div>
            )}

            {/* =====================  댓글 목록 영역  ===================== */}
            <div className="comments-section">
              <h4 className="comments-title">
                댓글 ({comments.length})
              </h4>
              {commentsError && (
                <div className="error-message">{commentsError}</div>
              )}
              {comments.length === 0 ? (
                <div className="no-comments">작성된 댓글이 없습니다.</div>
              ) : (
                <ul className="comments-list">
                  {comments.map((c) => (
                    <li key={c.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">
                          {c.author}
                        </span>
                        <span className="comment-date">
                          {c.createdAt}
                        </span>
                      </div>
                      <div className="comment-content">
                        {c.content}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* ======================================================= */}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
