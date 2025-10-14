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
    targetType: null,
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
    <div className="detail-page">
      <div className="grain-overlay" />
      <Header />

      <div className="detail-container">
        <div className="detail-header">
          <div className="header-content">
            <h1>커뮤니티</h1>
            <p>게시물 상세 보기</p>
          </div>
          <button className="btn-back-header" onClick={handleBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            목록으로
          </button>
        </div>

        {error ? (
          <div className="error-msg">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 6V10M10 13V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        ) : !post ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>게시글을 불러오는 중...</p>
          </div>
        ) : (
          <div className="post-detail-content">
            <div className="post-detail-card">
              <h2 className="post-detail-title">{post.title}</h2>
              
              <div className="post-detail-meta">
                <div className="meta-left">
                  <span className="meta-author">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 14C2 11.2386 4.23858 9 7 9H9C11.7614 9 14 11.2386 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    {post.author}
                  </span>
                  <span className="meta-divider">•</span>
                  <span className="meta-date">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    {post.createdAt}
                  </span>
                </div>
                <div className="meta-right">
                  <span className="meta-views">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8C1 8 3 4 8 4C13 4 15 8 15 8C15 8 13 12 8 12C3 12 1 8 1 8Z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    {post.views}
                  </span>
                  <span className="meta-divider">•</span>
                  <span className="meta-comments">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2H14V10H8L5 13V10H2V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    {comments.length}
                  </span>
                </div>
              </div>

              <div className="post-detail-body">{post.content}</div>

              {post.imageUrls.length > 0 && (
                <div className="image-gallery">
                  {post.imageUrls.map((url, idx) => {
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

              <div className="post-actions">
                {currentUserNickname === post.author && (
                  <button className="btn-action btn-edit" onClick={handleEdit}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M11 2L14 5L5 14H2V11L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    수정
                  </button>
                )}
                {(currentUserNickname === post.author || currentUserRole === 'ADMIN') && (
                  <button className="btn-action btn-delete" onClick={handleDelete}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4H12V13C12 13.5523 11.5523 14 11 14H5C4.44772 14 4 13.5523 4 13V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    삭제
                  </button>
                )}
                {currentUserNickname && (
                  <button
                    className="btn-action btn-report"
                    onClick={() => setReportModal({ open: true, targetType: 'POST', targetId: post.id })}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2V8M8 11V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3 14L8 2L13 14H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    신고
                  </button>
                )}
              </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="comments-section">
              <h3 className="comments-header">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 3H17V13H10L6 17V13H3V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                댓글 <span className="comment-count">{comments.length}</span>
              </h3>

              {currentUserNickname ? (
                <div className="comment-write">
                  <textarea
                    className="comment-textarea"
                    placeholder="댓글을 입력하세요..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button 
                    className="btn-comment-submit" 
                    onClick={handleCommentSubmit} 
                    disabled={!newComment.trim()}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8L14 2L8 14L7 10L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    댓글 등록
                  </button>
                </div>
              ) : (
                <div className="comment-login-prompt">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 8V12M12 15V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <p>댓글을 작성하려면 로그인해주세요.</p>
                </div>
              )}

              {commentsError && (
                <div className="error-msg">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 6V10M10 13V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {commentsError}
                </div>
              )}

              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="empty-comments">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                      <path d="M12 12H52V40H32L22 50V40H12V12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    </svg>
                    <p>작성된 댓글이 없습니다</p>
                    <span>첫 번째 댓글을 작성해보세요!</span>
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="comment-item">
                      <div className="comment-header">
                        <div className="comment-author">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M2 14C2 11.2386 4.23858 9 7 9H9C11.7614 9 14 11.2386 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          {c.writerNickname}
                        </div>
                        <div className="comment-meta">
                          <span className="comment-date">{c.createdAt}</span>
                          <div className="comment-actions">
                            {currentUserNickname === c.writerNickname && (
                              <>
                                <button onClick={() => handleCommentEdit(c.id, c.content)}>수정</button>
                                <button onClick={() => handleCommentDelete(c.id)}>삭제</button>
                              </>
                            )}
                            {currentUserRole === 'ADMIN' && currentUserNickname !== c.writerNickname && (
                              <button onClick={() => handleCommentDelete(c.id)}>삭제</button>
                            )}
                            {currentUserNickname && currentUserNickname !== c.writerNickname && (
                              <button
                                onClick={() => setReportModal({ open: true, targetType: 'COMMENT', targetId: c.id })}
                              >
                                신고
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="comment-content">{c.content}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 신고 모달 */}
      {reportModal.open && (
        <div className="report-modal-overlay" onClick={() => setReportModal({ open: false, targetType: null, targetId: null })}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <div className="report-modal-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3V10M10 14V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M4 17L10 3L16 17H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                {reportModal.targetType === 'POST' ? '게시글 신고하기' : '댓글 신고하기'}
              </h3>
              <button 
                className="modal-close" 
                onClick={() => setReportModal({ open: false, targetType: null, targetId: null })}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M5 5L15 15M5 15L15 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <p className="report-description">문제되는 사유를 선택하세요. 최대 3개까지 선택할 수 있습니다.</p>
            
            <div className="report-reasons">
              {[
                { code: 'SPAM', label: '스팸/광고', icon: '📧' },
                { code: 'ABUSE', label: '욕설/비방', icon: '💢' },
                { code: 'HATE', label: '차별/혐오', icon: '⚠️' },
                { code: 'SEXUAL', label: '음란/불건전', icon: '🔞' },
                { code: 'ILLEGAL', label: '불법 정보', icon: '⛔' },
                { code: 'PERSONAL_INFO', label: '개인정보 노출', icon: '🔒' },
                { code: 'OTHER', label: '기타', icon: '📝' }
              ].map(r => (
                <label key={r.code} className={`report-reason ${reportReasons.includes(r.code) ? 'selected' : ''}`}>
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
                  <span className="reason-icon">{r.icon}</span>
                  <span className="reason-label">{r.label}</span>
                </label>
              ))}
            </div>
            
            <textarea
              className="report-textarea"
              placeholder="추가 설명을 입력하세요 (선택사항, 100자 이하)"
              value={reportDescription}
              onChange={e => setReportDescription(e.target.value)}
              maxLength={100}
            />
            <div className="char-count">{reportDescription.length}/100</div>
            
            <div className="report-actions">
              <button className="btn-cancel" onClick={() => setReportModal({ open: false, targetType: null, targetId: null })}>
                취소
              </button>
              <button className="btn-submit" onClick={handleReportSubmit}>
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}