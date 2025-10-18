// src/pages/AnnouncementDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaComment, FaEye, FaThumbtack, FaReply, FaTrash, FaEdit } from 'react-icons/fa';
import './AnnouncementDetailPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [announcement, setAnnouncement] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  // JWT에서 사용자 정보 파싱
  const [currentUserNickname, setCurrentUserNickname] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

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

  // 관리자 권한 체크 (더 명확하게)
  function checkAdminRole() {
    try {
      const roles = JSON.parse(localStorage.getItem('roles') || '[]');
      const isAdminRole = roles.includes('ROLE_ADMIN') || 
                          roles.includes('ADMIN') ||
                          roles.some(role => role.authority === 'ROLE_ADMIN');
      
      console.log('🔐 관리자 권한 체크:', isAdminRole);
      return isAdminRole;
    } catch {
      return false;
    }
  }

  const isAdmin = checkAdminRole();

  // 공지사항 조회
  useEffect(() => {
    fetchAnnouncement();
    fetchComments();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/announcements/${id}`);
      setAnnouncement(response.data);
      setIsLiked(response.data.isLiked || false);
    } catch (err) {
      setError('공지사항을 불러오는데 실패했습니다.');
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/announcements/${id}/comments`);
      console.log('📝 전체 댓글 데이터:', response.data);
      
      // 댓글 데이터 매핑 (필드명 통일)
      const mappedComments = response.data.map(c => {
        console.log(`댓글 ID: ${c.id}, parentCommentId: ${c.parentCommentId}, writer: ${c.writerNickname}`);
        return {
          id: c.id,
          content: c.content,
          writer: c.writerNickname || '익명',
          parentId: c.parentCommentId, // ⭐ parentCommentId -> parentId로 변환
          createdAt: c.createdAt,
          replies: c.replies || [] // ⭐ 중첩 구조 지원
        };
      });
      
      console.log('✅ 매핑된 댓글:', mappedComments);
      
      // 평평한 구조로 변환 (대댓글을 1depth로 펼침)
      const flatComments = [];
      mappedComments.forEach(comment => {
        flatComments.push(comment);
        if (comment.replies && comment.replies.length > 0) {
          comment.replies.forEach(reply => {
            flatComments.push({
              ...reply,
              writer: reply.writerNickname || '익명',
              parentId: comment.id // 부모 ID 설정
            });
          });
        }
      });
      
      console.log('👨 부모 댓글:', flatComments.filter(c => !c.parentId));
      console.log('👶 자식 댓글:', flatComments.filter(c => c.parentId));
      
      setComments(flatComments);
    } catch (err) {
      console.error('댓글 로딩 실패:', err);
    }
  };

  // 좋아요
  const handleLike = async () => {
    if (!currentUserNickname) {
      alert('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/auth');
        return;
      }
      
      await axios.post(
        `${API_BASE_URL}/api/announcements/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsLiked(!isLiked);
      fetchAnnouncement();
    } catch (err) {
      console.error('좋아요 실패:', err);
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다.');
        navigate('/auth');
      }
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async () => {
    if (!currentUserNickname) {
      alert('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/auth');
        return;
      }

      // ⭐ 필드명을 parentCommentId로 변경!
      const payload = {
        content: newComment,
        parentCommentId: replyTo?.id || null  // parentId → parentCommentId
      };

      console.log('📤 댓글 작성 요청:', payload);
      console.log('- 부모 댓글 ID:', replyTo?.id);
      console.log('- 부모 댓글 작성자:', replyTo?.writer);

      await axios.post(
        `${API_BASE_URL}/api/announcements/${id}/comments`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ 댓글 작성 완료');
      setNewComment('');
      setReplyTo(null);
      fetchComments();
      fetchAnnouncement();
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다.');
        navigate('/auth');
      } else {
        alert('댓글 작성에 실패했습니다.');
      }
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      console.log('🔑 토큰 확인:', token ? '존재함' : '없음');
      
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/auth');
        return;
      }

      // ⭐ 경로 수정: announcementId 포함
      const response = await axios.delete(
        `${API_BASE_URL}/api/announcements/${id}/comments/${commentId}`, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ 삭제 성공:', response.data);
      alert('댓글이 삭제되었습니다.');
      fetchComments();
      fetchAnnouncement(); // 댓글 수도 업데이트
    } catch (err) {
      console.error('❌ 댓글 삭제 실패:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        navigate('/auth');
      } else if (err.response?.status === 403) {
        alert('댓글 삭제 권한이 없습니다.');
      } else {
        alert('댓글 삭제에 실패했습니다.');
      }
    }
  };

  // 공지사항 삭제
  const handleDelete = async () => {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/auth');
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('삭제되었습니다.');
      navigate('/announcement');
    } catch (err) {
      console.error('삭제 실패:', err);
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다.');
        navigate('/auth');
      } else {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  function getCategoryLabel(category) {
    const labels = {
      NOTICE: '공지',
      EVENT: '이벤트',
      UPDATE: '업데이트',
      MAINTENANCE: '점검'
    };
    return labels[category] || category;
  }

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

  if (error) {
    return (
      <div className="detail-page">
        <div className="grain-overlay" />
        <Header />
        <div className="detail-container">
          <div className="error-msg">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 6V10M10 13V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="detail-page">
        <div className="grain-overlay" />
        <Header />
        <div className="detail-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>공지사항을 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="grain-overlay" />
      <Header />

      <div className="detail-container">
        {/* 헤더 */}
        <div className="detail-header">
          <div className="header-content">
            <h1>공지사항</h1>
            <p>상세 보기</p>
          </div>
          <button className="btn-back-header" onClick={() => navigate('/announcement')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            목록으로
          </button>
        </div>

        {/* 공지사항 상세 */}
        <div className="post-detail-content">
          <div className="post-detail-card">
            {/* 제목 영역 */}
            <div className="title-section">
              <div className="title-badges">
                <span className={`category-badge ${announcement.category.toLowerCase()}`}>
                  {getCategoryLabel(announcement.category)}
                </span>
                {announcement.isPinned && (
                  <span className="pinned-badge">
                    <FaThumbtack /> 고정
                  </span>
                )}
              </div>
              <h2 className="post-detail-title">{announcement.title}</h2>
            </div>

            {/* 메타 정보 */}
            <div className="post-detail-meta">
              <div className="meta-left">
                <span className="meta-author">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 14C2 11.2386 4.23858 9 7 9H9C11.7614 9 14 11.2386 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {announcement.writer}
                </span>
                <span className="meta-divider">•</span>
                <span className="meta-date">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  {formatDate(announcement.createdAt)}
                </span>
              </div>
              <div className="meta-right">
                <span className="meta-views">
                  <FaEye />
                  {announcement.viewCount}
                </span>
                <span className="meta-divider">•</span>
                <span className="meta-likes">
                  <FaHeart />
                  {announcement.likeCount}
                </span>
                <span className="meta-divider">•</span>
                <span className="meta-comments">
                  <FaComment />
                  {announcement.commentCount}
                </span>
              </div>
            </div>

            {/* 본문 */}
            <div className="post-detail-body">{announcement.content}</div>

            {/* 액션 버튼 */}
            <div className="post-actions">
              <button className={`btn-action btn-like ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
                <FaHeart /> 좋아요 {announcement.likeCount}
              </button>

              {/* ⭐ 모든 관리자가 수정/삭제 가능 */}
              {isAdmin && (
                <>
                  <button className="btn-action btn-edit" onClick={() => navigate(`/announcement/${id}/edit`)}>
                    <FaEdit /> 수정
                  </button>
                  <button className="btn-action btn-delete" onClick={handleDelete}>
                    <FaTrash /> 삭제
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="comments-section">
            <h3 className="comments-header">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 3H17V13H10L6 17V13H3V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              댓글 <span className="comment-count">{announcement.commentCount}</span>
            </h3>

            {/* 댓글 작성 */}
            {currentUserNickname ? (
              <div className="comment-write">
                {replyTo && (
                  <div className="reply-info">
                    <span>@{replyTo.writer}에게 답글</span>
                    <button onClick={() => setReplyTo(null)}>취소</button>
                  </div>
                )}
                <textarea
                  className="comment-textarea"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 입력하세요..."
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
                <p>댓글을 작성하려면 <a href="/auth">로그인</a>해주세요.</p>
              </div>
            )}

            {/* 댓글 목록 */}
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
                  .filter(c => !c.parentId)
                  .map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      replies={comments.filter(c => c.parentId === comment.id)}
                      currentUserNickname={currentUserNickname}
                      currentUserRole={currentUserRole}
                      onReply={setReplyTo}
                      onDelete={handleDeleteComment}
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// 댓글 컴포넌트
function Comment({ comment, replies, currentUserNickname, currentUserRole, onReply, onDelete }) {
  return (
    <>
      <div className={`comment-item ${comment.parentId ? 'reply' : ''}`}>
        <div className="comment-header">
          <div className="comment-author">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 14C2 11.2386 4.23858 9 7 9H9C11.7614 9 14 11.2386 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {comment.writer}
          </div>
          <div className="comment-meta">
            <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
            <div className="comment-actions">
              {!comment.parentId && <button onClick={() => onReply(comment)}>답글</button>}
              {(currentUserNickname === comment.writer || currentUserRole === 'ADMIN') && (
                <button onClick={() => onDelete(comment.id)}>삭제</button>
              )}
            </div>
          </div>
        </div>
        <div className="comment-content">{comment.content}</div>
      </div>
      
      {/* 대댓글 렌더링 */}
      {replies && replies.length > 0 && (
        <div className="replies-container">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              replies={[]}
              currentUserNickname={currentUserNickname}
              currentUserRole={currentUserRole}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}