// src/pages/CommunityCreatePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CommunityCreatePage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CommunityCreatePage() {
  const navigate = useNavigate();

  // 1) JWT 토큰에서 현재 사용자의 닉네임 추출 (로그인 여부 확인)
  const [currentUserNickname, setCurrentUserNickname] = useState(null);

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
      const nicknameFromToken = decoded.nickname || decoded.username || decoded.sub;
      setCurrentUserNickname(nicknameFromToken);
    } catch (e) {
      console.error('토큰 디코딩 실패:', e);
      setCurrentUserNickname(null);
    }
  }, []);

  // 2) 입력 상태를 관리할 state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null); // 폼 검증 또는 서버 오류 메시지

  // 3) 뒤로 가기 버튼 핸들러
  const handleBack = () => {
    navigate('/community');
  };

  // 4) 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 제목/내용 빈 칸 검사
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    if (!token) {
      setError('로그인이 필요합니다.');
      return;
    }

    try {
      // API 호출: POST /api/posts
      const response = await axios.post(
        'http://localhost:8080/api/posts',
        { title: title.trim(), content: content.trim() }, // PostRequest DTO 형태
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newPostId = response.data; // 성공 시 반환된 게시글 ID

      // 생성된 게시글 상세 페이지로 이동
      navigate(`/community/${newPostId}`);
    } catch (err) {
      console.error('게시글 작성 실패:', err);
      setError('게시글 작성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="create-background">
      <Header />

      <div className="create-page">
        <h2 className="create-title">커뮤니티</h2>
        <div className="create-subtitle">새 게시글 작성</div>

        {!currentUserNickname ? (
          <div className="create-login-prompt">
            게시글을 작성하려면 로그인해주세요.
          </div>
        ) : (
          <form className="create-form" onSubmit={handleSubmit}>
            {error && <div className="create-error">{error}</div>}

            {/* 제목 입력 */}
            <label className="create-label" htmlFor="post-title">
              제목
            </label>
            <input
              id="post-title"
              type="text"
              className="create-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              maxLength={100}
            />

            {/* 내용 입력 */}
            <label className="create-label" htmlFor="post-content">
              내용
            </label>
            <textarea
              id="post-content"
              className="create-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={10}
            />

            {/* 버튼 그룹 */}
            <div className="create-button-group">
              <button
                type="button"
                className="btn-create-back"
                onClick={handleBack}
              >
                취소
              </button>
              <button type="submit" className="btn-create-submit">
                게시글 등록
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}
