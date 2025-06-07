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

  // 현재 로그인한 사용자의 닉네임 & 역할
  const [currentUserNickname, setCurrentUserNickname] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // ──────────────────────────────────────────────────────
  // 0) JWT 토큰에서 현재 사용자의 닉네임과 role 추출
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    if (!token) {
      setCurrentUserNickname(null);
      setCurrentUserRole(null);
      return;
    }

    try {
      // 페이로드 디코딩
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(json);
      console.log('JWT payload:', decoded);

      // nickname
      const nick = decoded.nickname || decoded.username || decoded.sub;
      setCurrentUserNickname(nick);

      // role (백엔드가 "role":"ADMIN" 클레임을 넣었다고 가정)
      // 또는 decoded.roles = ["ROLE_ADMIN"] 형태일 수도 있으니 모두 대응
      let role = null;
      if (decoded.role) {
        role = decoded.role.toUpperCase();
      } else if (Array.isArray(decoded.roles) && decoded.roles.length) {
        role = decoded.roles[0].split('_').pop(); // "ROLE_ADMIN" → "ADMIN"
      } else if (Array.isArray(decoded.authorities) && decoded.authorities.length) {
        role = decoded.authorities[0].split('_').pop();
      }
      setCurrentUserRole(role);  
      console.log('parsed role:', role);
    } catch (e) {
      console.error('토큰 디코딩 오류:', e);
      setCurrentUserNickname(null);
      setCurrentUserRole(null);
    }
  }, []);

  // ──────────────────────────────────────────────────────
  // 1) 게시물 상세 조회
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/posts/${id}`)
      .then((res) => {
        const data = res.data;
        setPost({
          id: data.id,
          title: data.title,
          content: data.content,
          author: data.writer,
          views: data.viewCount,
          createdAt: formatDate(data.createdAt),
          imageUrls: data.imageUrls || []
        });
      })
      .catch((err) => {
        console.error('게시물 조회 실패:', err);
        setError('게시물을 불러오는 중 오류가 발생했습니다.');
      });
  }, [id]);

  // 날짜 포맷터
  function formatDate(iso) {
    if (!iso) return '';
    const then = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}초 전`;
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}일 전`;
    return then.toLocaleDateString();
  }

  const handleBack = () => navigate('/community');
  const handleEdit = () => navigate(`/community/${id}/edit`);

  // 게시물 삭제 (작성자 or ADMIN)
  const handleDelete = () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    const url = `http://localhost:8080/api/posts/${id}`;
    axios
      .delete(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        alert('삭제되었습니다.');
        navigate('/community');
      })
      .catch((err) => {
        console.error('삭제 실패:', err);
        alert('삭제 중 오류가 발생했습니다.');
      });
  };

  // ──────────────────────────────────────────────────────
  // 2) 댓글 목록 조회
  const fetchComments = () => {
    axios
      .get(`http://localhost:8080/api/posts/${id}/comments`)
      .then((res) => {
        setComments(
          res.data.map((c) => ({
            id: c.id,
            content: c.content,
            author: c.writerNickname,
            writerUsername: c.writerUsername,
            createdAt: formatDate(c.createdAt)
          }))
        );
      })
      .catch((err) => {
        console.error('댓글 조회 실패:', err);
        setCommentsError('댓글을 불러오는 중 오류가 발생했습니다.');
      });
  };
  useEffect(fetchComments, [id]);

  // 댓글 등록
  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    axios
      .post(
        `http://localhost:8080/api/posts/${id}/comments`,
        { content: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const c = res.data;
        setComments((prev) => [
          {
            id: c.id,
            content: c.content,
            author: c.writerNickname || c.nickname,
            writerUsername: c.writerUsername,
            createdAt: formatDate(c.createdAt)
          },
          ...prev
        ]);
        setNewComment('');
      })
      .catch((err) => {
        console.error('댓글 등록 실패:', err);
        alert('댓글 등록 중 오류가 발생했습니다.');
      });
  };

  // 댓글 수정
  const handleCommentEdit = (commentId, oldText) => {
    const newText = window.prompt('수정할 내용을 입력하세요.', oldText);
    if (!newText?.trim()) return;
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    axios
      .put(
        `http://localhost:8080/api/posts/${id}/comments/${commentId}`,
        { content: newText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, content: newText.trim(), createdAt: formatDate(res.data.createdAt) }
              : c
          )
        );
      })
      .catch((err) => {
        console.error('댓글 수정 실패:', err);
        alert('댓글 수정 중 오류가 발생했습니다.');
      });
  };

  // 댓글 삭제
  const handleCommentDelete = (commentId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    axios
      .delete(`http://localhost:8080/api/posts/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => setComments((prev) => prev.filter((c) => c.id !== commentId)))
      .catch((err) => {
        console.error('댓글 삭제 실패:', err);
        alert('댓글 삭제 중 오류가 발생했습니다.');
      });
  };

  return (
    <div className="community-background">
      <Header />

      <div className="community-detail-page">
        <h2 className="detail-title">커뮤니티</h2>
        <div className="detail-subtitle">게시물 상세 보기</div>

        {error ? (
          <div className="error-message">{error}</div>
        ) : !post ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <div className="detail-container">
            <h3 className="post-title">{post.title}</h3>
            <div className="post-meta">
              <span className="meta-author">{post.author}</span>
              <span className="meta-views">👁️ {post.views}</span>
              <span className="meta-date">{post.createdAt}</span>
            </div>
            <div className="post-content">{post.content}</div>

            {post.imageUrls.length > 0 && (
              <div className="image-gallery">
                {post.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={`http://localhost:8080${url}`}
                    alt={`img-${idx}`}
                    className="post-image"
                  />
                ))}
              </div>
            )}

            <div className="button-group">
              <button className="btn-back" onClick={handleBack}>
                목록으로
              </button>
              { (currentUserNickname === post.author) ||
                (currentUserRole === 'ADMIN') ? (
                <>
                  <button className="btn-edit" onClick={handleEdit}>
                    수정
                  </button>
                  <button className="btn-delete" onClick={handleDelete}>
                    삭제
                  </button>
                </>
              ) : null }
            </div>

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

            <div className="comments-section">
              <h4 className="comments-title">댓글 ({comments.length})</h4>
              {commentsError && <div className="error-message">{commentsError}</div>}
              {comments.length === 0 ? (
                <div className="no-comments">작성된 댓글이 없습니다.</div>
              ) : (
                <ul className="comments-list">
                  {comments.map((c) => (
                    <li key={c.id} className="comment-item">
                      <div className="comment-header">
                        <span className="comment-author">{c.author}</span>
                        {(currentUserNickname === c.writerUsername ||
                          currentUserRole === 'ADMIN') ? (
                          <div className="comment-meta-right">
                            <div className="comment-button-group">
                              <button
                                className="comment-edit-btn"
                                onClick={() => handleCommentEdit(c.id, c.content)}
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
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
