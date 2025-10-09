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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentsError, setCommentsError] = useState(null);

  const [newComment, setNewComment] = useState('');

  const [currentUserNickname, setCurrentUserNickname] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // 신고 모달 상태
  const [reportModal, setReportModal] = useState({
    open: false,
    targetType: null, // "POST" | "COMMENT"
    targetId: null,
  });
  const [reportReasons, setReportReasons] = useState([]);
  const [reportDescription, setReportDescription] = useState('');

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

  // 게시글 상세
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/posts/${id}`)
      .then(res => {
        const d = res.data;
        setPost({
          id: d.id,
          title: d.title,
          content: d.content,
          author: d.writer,
          views: d.viewCount,
          createdAt: formatDate(d.createdAt),
          imageUrls: d.imageUrls || []
        });
      })
      .catch(() => setError('게시물을 불러오는 중 오류가 발생했습니다.'));
  }, [id]);

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

  const handleDelete = () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    axios.delete(`${API_BASE_URL}/api/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => { alert('삭제되었습니다.'); navigate('/community'); })
      .catch(() => alert('삭제 중 오류가 발생했습니다.'));
  };

  // 댓글 불러오기
  const fetchComments = () => {
    axios.get(`${API_BASE_URL}/api/posts/${id}/comments`)
      .then(res => {
        setComments(res.data.map(c => ({
          id: c.id,
          content: c.content,
          writerNickname: c.writerNickname,
          createdAt: formatDate(c.createdAt)
        })));
      })
      .catch(() => setCommentsError('댓글을 불러오는 중 오류가 발생했습니다.'));
  };
  useEffect(fetchComments, [id]);

  // 댓글 등록
  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    axios.post(`${API_BASE_URL}/api/posts/${id}/comments`,
      { content: newComment.trim() },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        const c = res.data;
        setComments(prev => [{
          id: c.id,
          content: c.content,
          writerNickname: c.writerNickname,
          createdAt: formatDate(c.createdAt)
        }, ...prev]);
        setNewComment('');
      })
      .catch(() => alert('댓글 등록 중 오류가 발생했습니다.'));
  };

  // 댓글 수정
  const handleCommentEdit = (commentId, oldText) => {
    const newText = window.prompt('수정할 내용을 입력하세요.', oldText);
    if (!newText?.trim()) return;
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    axios.put(`${API_BASE_URL}/api/posts/${id}/comments/${commentId}`,
      { content: newText.trim() },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        setComments(prev => prev.map(c =>
          c.id === commentId ? { ...c, content: newText.trim(), createdAt: formatDate(res.data.createdAt) } : c
        ));
      })
      .catch(() => alert('댓글 수정 중 오류가 발생했습니다.'));
  };

  // 댓글 삭제
  const handleCommentDelete = commentId => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    axios.delete(`${API_BASE_URL}/api/posts/${id}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        alert('댓글이 성공적으로 삭제되었습니다.');
        setComments(prev => prev.filter(c => c.id !== commentId));
      })
      .catch(() => alert('댓글 삭제 중 오류가 발생했습니다.'));
  };

  // 신고 제출
  const handleReportSubmit = () => {
    if (reportReasons.length === 0) {
      alert('신고 사유를 선택하세요.');
      return;
    }
    if (reportDescription.length > 100) {
      alert('신고 내용은 100자 이하여야 합니다.');
      return;
    }
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const url = reportModal.targetType === 'POST'
      ? `${API_BASE_URL}/api/reports/posts/${reportModal.targetId}`
      : `${API_BASE_URL}/api/reports/comments/${reportModal.targetId}`;
    axios.post(url, {
      reasons: reportReasons,
      description: reportDescription
    }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        alert('신고가 접수되었습니다.');
        setReportModal({ open: false, targetType: null, targetId: null });
        setReportReasons([]);
        setReportDescription('');
      })
      .catch(() => alert('신고 중 오류가 발생했습니다.'));
  };

  return (
    <div className="community-background">
      <Header />

      <div className="community-detail-page">
        <h2 className="detail-title">커뮤니티</h2>
        <div className="detail-subtitle">게시물 상세 보기</div>

        {error
          ? <div className="error-message">{error}</div>
          : !post
            ? <div className="loading">로딩 중...</div>
            : (
              <div className="detail-container">
                <h3 className="post-title">{post.title}</h3>
                <div className="post-meta">
                  <span className="meta-author">{post.author}</span>
                  <span className="meta-views"> {post.views}</span>
                  <span className="meta-comments">💬 {comments.length}</span>
                  <span className="meta-date">{post.createdAt}</span>
                </div>
                <div className="post-content">{post.content}</div>

                {post.imageUrls.length > 0 && (
                  <div className="image-gallery">
                    {post.imageUrls.map((url, idx) => {
                      // Cloudinary URL 변환: 너비 1200px, 자동 품질, 자동 포맷
                      const transformedUrl = url.replace('/upload/', '/upload/w_1200,q_auto,f_auto/');
                      return (
                        <img 
                          key={idx} 
                          src={transformedUrl} 
                          alt={`img-${idx}`} 
                          className="post-image" 
                        />
                      );
                    })}
                  </div>
                )}

                <div className="button-group">
                  <button className="btn-back" onClick={handleBack}>목록으로</button>
                  {currentUserNickname === post.author && (
                    <button className="btn-edit" onClick={handleEdit}>수정</button>
                  )}
                  {(currentUserNickname === post.author || currentUserRole === 'ADMIN') && (
                    <button className="btn-delete" onClick={handleDelete}>삭제</button>
                  )}
                  {currentUserNickname && (
                    <button
                      className="btn-report"
                      onClick={() => setReportModal({ open: true, targetType: 'POST', targetId: post.id })}
                    >
                      🚨 신고
                    </button>
                  )}
                </div>

                {/* 댓글 입력 */}
                {currentUserNickname ? (
                  <div className="comment-input-container">
                    <textarea className="comment-input"
                      placeholder="댓글을 입력하세요..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                    />
                    <button className="btn-comment-submit" onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                      댓글 등록
                    </button>
                  </div>
                ) : (
                  <div className="comment-login-prompt">댓글을 작성하려면 로그인해주세요.</div>
                )}

                {/* 댓글 리스트 */}
                <div className="comments-section">
                  <h4 className="comments-title">댓글 ({comments.length})</h4>
                  {commentsError && <div className="error-message">{commentsError}</div>}
                  {comments.length === 0 ? (
                    <div className="no-comments">작성된 댓글이 없습니다.</div>
                  ) : (
                    <ul className="comments-list">
                      {comments.map(c => (
                        <li key={c.id} className="comment-item">
                          <div className="comment-header">
                            <span className="comment-author">{c.writerNickname}</span>
                            <div className="comment-meta-right">
                              <div className="comment-button-group">
                                {currentUserNickname === c.writerNickname && (
                                  <>
                                    <button className="comment-edit-btn" onClick={() => handleCommentEdit(c.id, c.content)}>수정</button>
                                    <button className="comment-delete-btn" onClick={() => handleCommentDelete(c.id)}>삭제</button>
                                  </>
                                )}
                                {currentUserRole === 'ADMIN' && currentUserNickname !== c.writerNickname && (
                                  <button className="comment-delete-btn" onClick={() => handleCommentDelete(c.id)}>삭제</button>
                                )}
                                {currentUserNickname && currentUserNickname !== c.writerNickname && (
                                  <button
                                    className="comment-report-btn"
                                    onClick={() => setReportModal({ open: true, targetType: 'COMMENT', targetId: c.id })}
                                  >
                                    🚨 신고
                                  </button>
                                )}
                              </div>
                              <span className="comment-date">{c.createdAt}</span>
                            </div>
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

      {/* 신고 모달 */}
      {reportModal.open && (
        <div className="report-modal">
          <div className="report-box" style={{ width: "500px" }}>
            <div className="report-header">
              <h3>
                🚨 {reportModal.targetType === 'POST' ? '게시글 신고하기' : '댓글 신고하기'}
              </h3>
              <button className="report-close" onClick={() => setReportModal({ open: false, targetType: null, targetId: null })}>✖</button>
            </div>
            <p className="report-desc">문제되는 사유를 선택하세요.<br />최대 3개까지 선택할 수 있습니다.</p>
            <div className="report-reasons">
              {[
                { code: 'SPAM', label: '스팸/광고' },
                { code: 'ABUSE', label: '욕설/비방' },
                { code: 'HATE', label: '차별/혐오' },
                { code: 'SEXUAL', label: '음란/불건전' },
                { code: 'ILLEGAL', label: '불법 정보' },
                { code: 'PERSONAL_INFO', label: '개인정보 노출' },
                { code: 'OTHER', label: '기타' }
              ].map(r => (
                <label key={r.code} className="report-reason">
                  <input
                    type="checkbox"
                    value={r.code}
                    checked={reportReasons.includes(r.code)}
                    onChange={e => {
                      if (e.target.checked) {
                        if (reportReasons.length < 3) setReportReasons([...reportReasons, r.code]);
                        else alert('최대 3개까지만 선택 가능합니다.');
                      } else {
                        setReportReasons(reportReasons.filter(rr => rr !== r.code));
                      }
                    }}
                  />
                  {r.label}
                </label>
              ))}
            </div>
            <textarea
              placeholder="추가 설명 (100자 이하)"
              value={reportDescription}
              onChange={e => setReportDescription(e.target.value)}
              maxLength={100}
              style={{ minHeight: "100px", resize: "vertical" }}
            />
            <div className="report-actions">
              <button onClick={handleReportSubmit}>신고</button>
              <button onClick={() => setReportModal({ open: false, targetType: null, targetId: null })}>취소</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
