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
  const [replyTo, setReplyTo] = useState(null);

  const [currentUserNickname, setCurrentUserNickname] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // 좋아요 상태
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [likedComments, setLikedComments] = useState(new Set());

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

  // 게시글 상세 + 좋아요 상태 조회
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/posts/${id}`);
        const d = res.data;
        setPost({
          id: d.id,
          title: d.title,
          content: d.content,
          author: d.writer,
          views: d.viewCount,
          likes: d.likeCount,
          createdAt: formatDate(d.createdAt),
          imageUrls: d.imageUrls || []
        });

        // ⭐ 게시글 좋아요 상태 확인
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (token) {
          try {
            const likeRes = await axios.get(
              `${API_BASE_URL}/api/posts/${id}/like/status`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsPostLiked(likeRes.data.isLiked || false);
          } catch (err) {
            console.log('좋아요 상태 조회 실패:', err);
          }
        }
      } catch {
        setError('게시물을 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchPost();
  }, [id, API_BASE_URL]);

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

  // ⭐ 게시글 좋아요 토글 (수정됨)
  const handlePostLike = async () => {
    if (!currentUserNickname) {
      alert('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/posts/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 서버 응답에서 새로운 상태 받기
      const newIsLiked = res.data.isLiked !== undefined ? res.data.isLiked : !isPostLiked;
      const newLikeCount = res.data.likeCount !== undefined ? res.data.likeCount : (isPostLiked ? post.likes - 1 : post.likes + 1);

      setIsPostLiked(newIsLiked);
      setPost(prev => ({
        ...prev,
        likes: newLikeCount
      }));
    } catch (err) {
      console.error('좋아요 오류:', err);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  // ⭐ 댓글 불러오기 (좋아요 상태 포함)
  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/posts/${id}/comments`);
      
      // 댓글을 평탄화 (replies를 별도로 분리하지 않음)
      const flatComments = [];
      const processComment = (comment) => {
        flatComments.push({
          id: comment.id,
          content: comment.content,
          writerNickname: comment.writerNickname,
          likeCount: comment.likeCount,
          createdAt: formatDate(comment.createdAt),
          parentCommentId: comment.parentCommentId
        });
        
        // ⭐ 대댓글도 평탄화
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach(processComment);
        }
      };

      res.data.forEach(processComment);
      setComments(flatComments);

      // ⭐ 댓글 좋아요 상태 확인
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (token && flatComments.length > 0) {
        try {
          const likeRes = await axios.get(
            `${API_BASE_URL}/api/posts/${id}/comments/likes/status`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          // 서버에서 [1, 3, 5] 같은 배열 형태로 받음
          const likedIds = likeRes.data.likedCommentIds || [];
          setLikedComments(new Set(likedIds));
        } catch (err) {
          console.log('댓글 좋아요 상태 조회 실패:', err);
        }
      }
    } catch {
      setCommentsError('댓글을 불러오는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id, API_BASE_URL]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('내용을 입력하세요.');
      return;
    }
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/posts/${id}/comments`,
        {
          content: newComment,
          parentCommentId: replyTo ? replyTo.id : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch {
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleCommentEdit = async (commentId, oldContent) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) { alert('로그인이 필요합니다.'); navigate('/auth'); return; }

    const newContent = prompt('수정할 내용을 입력하세요:', oldContent);
    if (!newContent || newContent.trim() === '') return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/posts/${id}/comments/${commentId}`,
        { content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
    } catch {
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/posts/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  // ⭐ 댓글 좋아요 토글
  const handleCommentLike = async (commentId) => {
    if (!currentUserNickname) {
      alert('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/posts/${id}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 서버 응답 처리
      const newIsLiked = res.data.isLiked;
      const newLikeCount = res.data.likeCount;

      // 좋아요 상태 업데이트
      setLikedComments(prev => {
        const newSet = new Set(prev);
        if (newIsLiked) {
          newSet.add(commentId);
        } else {
          newSet.delete(commentId);
        }
        return newSet;
      });

      // 댓글 좋아요 수 업데이트
      setComments(prevComments =>
        prevComments.map(c =>
          c.id === commentId ? { ...c, likeCount: newLikeCount } : c
        )
      );
    } catch (err) {
      console.error('댓글 좋아요 오류:', err);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  // ⭐ 신고 제출 (에러 처리 개선)
  const handleReportSubmit = async () => {
    if (reportReasons.length === 0) {
      alert('최소 1개 이상의 사유를 선택해주세요.');
      return;
    }

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    const endpoint = reportModal.targetType === 'POST'
      ? `${API_BASE_URL}/api/reports/posts/${reportModal.targetId}`
      : `${API_BASE_URL}/api/reports/comments/${reportModal.targetId}`;

    try {
      const response = await axios.post(
        endpoint,
        {
          reasons: reportReasons,
          description: reportDescription
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ 성공 응답 처리
      if (response.data.success) {
        alert(response.data.message || '신고가 접수되었습니다. 검토 후 조치하겠습니다.');
      } else {
        alert(response.data.message || '신고가 접수되었습니다.');
      }

      // 모달 닫기 및 초기화
      setReportModal({ open: false, targetType: null, targetId: null });
      setReportReasons([]);
      setReportDescription('');

    } catch (err) {
      console.error('신고 오류:', err);

      // ❌ 에러 응답 처리
      if (err.response) {
        const errorData = err.response.data;
        
        // 백엔드에서 보낸 에러 메시지 표시
        if (errorData.message) {
          alert(errorData.message);
        } else {
          // HTTP 상태 코드별 에러 처리
          switch (err.response.status) {
            case 400:
              alert('잘못된 요청입니다. 신고 대상을 확인해주세요.');
              break;
            case 401:
              alert('로그인이 필요합니다.');
              navigate('/auth');
              break;
            case 403:
              alert('신고 권한이 없습니다.');
              break;
            case 404:
              alert('신고 대상을 찾을 수 없습니다.');
              break;
            case 409:
              alert('이미 신고하셨습니다. 24시간 후에 다시 시도해주세요.');
              break;
            case 500:
              alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
              break;
            default:
              alert('신고 접수 중 오류가 발생했습니다.');
          }
        }
      } else if (err.request) {
        // 요청은 보냈지만 응답이 없는 경우
        alert('서버와 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
      } else {
        // 요청 설정 중 오류 발생
        alert('신고 요청 중 오류가 발생했습니다.');
      }
    }
  };

  if (error) return <div>{error}</div>;
  if (!post) return <div>로딩 중...</div>;

  return (
    <div className="community-detail-page">
      <Header />
      <div className="container">
        <div className="detail-content">
          <div className="detail-header">
            <button className="btn-back" onClick={handleBack}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              목록으로
            </button>
            <h1 className="detail-title">{post.title}</h1>
            <div className="detail-meta">
              <span className="author">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 14C2 11.2386 4.23858 9 7 9H9C11.7614 9 14 11.2386 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {post.author}
              </span>
              <span className="date">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {post.createdAt}
              </span>
              <span className="views">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {post.views}
              </span>
            </div>
          </div>

          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="detail-images">
              {post.imageUrls.map((url, index) => (
                <img key={index} src={url} alt={`게시글 이미지 ${index + 1}`} />
              ))}
            </div>
          )}

          <div className="detail-body">
            <p className="detail-text">{post.content}</p>
          </div>

          <div className="detail-footer">
            <div className="detail-actions">
              {/* ⭐ 좋아요 버튼 */}
              {currentUserNickname && (
                <button className={`btn-like ${isPostLiked ? 'liked' : ''}`} onClick={handlePostLike}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill={isPostLiked ? "currentColor" : "none"}>
                    <path d="M10 17L4 11C2 9 2 6 4 4C6 2 9 2 11 4L10 5L11 4C13 2 16 2 18 4C20 6 20 9 18 11L10 17Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  좋아요 {post.likes}
                </button>
              )}
              
              {currentUserNickname === post.author && (
                <>
                  <button className="btn-edit" onClick={handleEdit}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M11 2L14 5L6 13H3V10L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                    수정
                  </button>
                  <button className="btn-delete" onClick={handleDelete}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V12M10 7V12M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    삭제
                  </button>
                </>
              )}
              {currentUserRole === 'ADMIN' && currentUserNickname !== post.author && (
                <button className="btn-delete" onClick={handleDelete}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V12M10 7V12M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  삭제
                </button>
              )}
              {currentUserNickname && currentUserNickname !== post.author && (
                <button
                  className="btn-report"
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

          <div className="comments-section">
            <h2>댓글 {comments.length}</h2>
            
            {currentUserNickname && (
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                {replyTo && (
                  <div className="reply-indicator">
                    <span>@{replyTo.writerNickname} 님에게 답글 작성 중</span>
                    <button type="button" onClick={() => setReplyTo(null)}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                )}
                <textarea
                  placeholder={replyTo ? "답글을 입력하세요..." : "댓글을 입력하세요..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn-submit-comment">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8H14M14 8L8 2M14 8L8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {replyTo ? '답글 작성' : '댓글 작성'}
                </button>
              </form>
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
                comments
                  .filter(c => !c.parentCommentId) // 최상위 댓글만
                  .map(c => (
                    <CommentItem
                      key={c.id}
                      comment={c}
                      replies={comments.filter(r => r.parentCommentId === c.id)} // ⭐ 대댓글 필터링
                      currentUserNickname={currentUserNickname}
                      currentUserRole={currentUserRole}
                      likedComments={likedComments}
                      onReply={setReplyTo}
                      onEdit={handleCommentEdit}
                      onDelete={handleCommentDelete}
                      onLike={handleCommentLike}
                      onReport={setReportModal}
                    />
                  ))
              )}
            </div>
          </div>
        </div>
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

// ⭐ 댓글 컴포넌트 (대댓글 지원)
function CommentItem({ 
  comment, 
  replies, 
  currentUserNickname, 
  currentUserRole,
  likedComments,
  onReply, 
  onEdit, 
  onDelete, 
  onLike,
  onReport 
}) {
  const isLiked = likedComments.has(comment.id);

  return (
    <>
      <div className={`comment-item ${comment.parentCommentId ? 'reply' : ''}`}>
        <div className="comment-header">
          <div className="comment-author">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 14C2 11.2386 4.23858 9 7 9H9C11.7614 9 14 11.2386 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {comment.writerNickname}
          </div>
          <div className="comment-meta">
            <span className="comment-date">{comment.createdAt}</span>
            <div className="comment-actions">
              {/* 좋아요 버튼 */}
              {currentUserNickname && (
                <button 
                  className={`btn-like-comment ${isLiked ? 'liked' : ''}`}
                  onClick={() => onLike(comment.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill={isLiked ? "currentColor" : "none"}>
                    <path d="M7 12L2.5 7.5C1.5 6.5 1.5 4.5 2.5 3.5C3.5 2.5 5.5 2.5 6.5 3.5L7 4L7.5 3.5C8.5 2.5 10.5 2.5 11.5 3.5C12.5 4.5 12.5 6.5 11.5 7.5L7 12Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                  {comment.likeCount}
                </button>
              )}
              
              {/* 답글 버튼 (최상위 댓글만) */}
              {!comment.parentCommentId && currentUserNickname && (
                <button onClick={() => onReply(comment)}>답글</button>
              )}

              {currentUserNickname === comment.writerNickname && (
                <>
                  <button onClick={() => onEdit(comment.id, comment.content)}>수정</button>
                  <button onClick={() => onDelete(comment.id)}>삭제</button>
                </>
              )}
              {currentUserRole === 'ADMIN' && currentUserNickname !== comment.writerNickname && (
                <button onClick={() => onDelete(comment.id)}>삭제</button>
              )}
              {currentUserNickname && currentUserNickname !== comment.writerNickname && (
                <button
                  onClick={() => onReport({ open: true, targetType: 'COMMENT', targetId: comment.id })}
                >
                  신고
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="comment-content">{comment.content}</div>
      </div>

      {/* ⭐ 대댓글 렌더링 */}
      {replies && replies.length > 0 && (
        <div className="replies-container">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              replies={[]} // 대댓글의 대댓글은 표시 안함
              currentUserNickname={currentUserNickname}
              currentUserRole={currentUserRole}
              likedComments={likedComments}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </>
  );
}