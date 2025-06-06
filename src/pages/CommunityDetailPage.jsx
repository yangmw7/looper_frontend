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

  // 게시물 데이터 (imageUrls를 포함하도록 상태에 추가)
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
  // 1) 게시물 상세 조회 (imageUrls 포함)
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/posts/${id}`)
      .then((response) => {
        const data = response.data;

        setPost({
          id: data.id,
          title: data.title,
          content: data.content,
          // 백엔드에서 writer 필드로 작성자 닉네임을 내려준다고 가정
          author: data.writer,
          views: data.viewCount,
          createdAt: formatDate(data.createdAt),
          // 백엔드가 imageUrls를 List<String> 형태로 내려준다고 가정
          imageUrls: data.imageUrls || [], 
        });
      })
      .catch((err) => {
        console.error('게시물 상세 조회 실패:', err);
        setError('게시물을 불러오는 중 오류가 발생했습니다.');
      });
  }, [id]);

  // ──────────────────────────────────────────────────────
  // 2) 댓글 목록 조회
  const fetchComments = () => {
    axios
      .get(`http://localhost:8080/api/posts/${id}/comments`)
      .then((response) => {
        // response.data는 CommentResponse DTO 배열:
        // { id, content, writerNickname, createdAt, writerUsername, ... }
        const apiComments = response.data.map((c) => {
          // 백엔드에서 내려준 c.createdAt이 ISO 문자열이라고 가정
          const rawCreated = c.createdAt;
          return {
            id: c.id,
            content: c.content,
            author: c.writerNickname,
            createdAt: formatDate(rawCreated),    // 반드시 포맷팅
            writerUsername: c.writerUsername,      // 로그인 비교용
          };
        });
        setComments(apiComments);
      })
      .catch((err) => {
        console.error('댓글 목록 조회 실패:', err);
        setCommentsError('댓글을 불러오는 중 오류가 발생했습니다.');
      });
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  // 날짜 포맷팅 함수 (게시물/댓글 공용)
  function formatDate(isoString) {
    if (!isoString) return ''; // isoString이 없으면 빈 문자열 반환
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

  // 게시물 수정
  const handleEdit = () => {
    navigate(`/community/${id}/edit`);
  };

  // 게시물 삭제
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
        const saved = response.data;
        const rawCreated = saved.createdAt || new Date().toISOString();
        const newlyAdded = {
          id: saved.id,
          content: saved.content,
          author: saved.writerNickname || saved.nickname,
          createdAt: formatDate(rawCreated),
          writerUsername: saved.writerUsername,
        };
        setComments((prev) => [newlyAdded, ...prev]);
        setNewComment(''); // 입력창 비우기
      })
      .catch((err) => {
        console.error('댓글 작성 실패:', err);
        alert('댓글 등록 중 오류가 발생했습니다.');
      });
  };

  // ──────────────────────────────────────────────────────
  // 4) 댓글 수정 핸들러
  const handleCommentEdit = (commentId, oldContent) => {
    const newContent = window.prompt('댓글을 수정하세요.', oldContent);
    if (newContent == null) return; // 취소
    if (!newContent.trim()) {
      alert('빈 댓글로 수정할 수 없습니다.');
      return;
    }

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    axios
      .put(
        `http://localhost:8080/api/posts/${id}/comments/${commentId}`,
        { content: newContent.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        const returned = response.data;
        const formattedTime = returned.createdAt
          ? formatDate(returned.createdAt)
          : '방금 전';

        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  content: newContent.trim(),
                  createdAt: formattedTime,
                }
              : c
          )
        );
        alert('수정이 완료되었습니다.');
      })
      .catch((err) => {
        console.error('댓글 수정 실패:', err);
        const msg = err.response?.data?.message || '댓글 수정 중 오류가 발생했습니다.';
        alert(msg);
      });
  };

  // ──────────────────────────────────────────────────────
  // 5) 댓글 삭제 핸들러
  const handleCommentDelete = (commentId) => {
    if (!window.confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    axios
      .delete(`http://localhost:8080/api/posts/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        alert('삭제가 완료되었습니다.');
      })
      .catch((err) => {
        console.error('댓글 삭제 실패:', err);
        const msg = err.response?.data?.message || '댓글 삭제 중 오류가 발생했습니다.';
        alert(msg);
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
              <span className="meta-author">{post.author}</span>
              <span className="meta-views">{post.views}</span>
              <span className="meta-date">{post.createdAt}</span>
            </div>

            <div className="post-content">{post.content}</div>

            {/* =====================  이미지 갤러리 영역  ===================== */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="image-gallery">
                {post.imageUrls.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:8080${imgUrl}`}
                    alt={`post-img-${idx}`}
                    className="post-image"
                  />
                ))}
              </div>
            )}

            <div className="button-group">
              <button className="btn-back" onClick={handleBack}>
                목록으로
              </button>
              {currentUserNickname &&
                post.author &&
                currentUserNickname === post.author && (
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
              <h4 className="comments-title">댓글 ({comments.length})</h4>
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
                        <span className="comment-author">{c.author}</span>

                        {currentUserNickname === c.author ? (
                          <div className="comment-meta-right">
                            <div className="comment-button-group">
                              <button
                                className="comment-edit-btn"
                                onClick={() =>
                                  handleCommentEdit(c.id, c.content)
                                }
                              >
                                수정
                              </button>
                              <button
                                className="comment-delete-btn"
                                onClick={() => handleCommentDelete(c.id)}
                              >
                                삭제
                              </button>
                            </div>
                            <span className="comment-date">{c.createdAt}</span>
                          </div>
                        ) : (
                          <span className="comment-date">{c.createdAt}</span>
                        )}
                      </div>

                      <div className="comment-content">{c.content}</div>
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
