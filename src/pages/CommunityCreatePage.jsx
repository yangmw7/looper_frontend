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
  const [imageFiles, setImageFiles] = useState([]); // 파일 배열 상태
  const [error, setError] = useState(null);

  // 3) 뒤로 가기 버튼 핸들러
  const handleBack = () => {
    navigate('/community');
  };

  // 4) 파일(input[type="file"])이 변경되었을 때 호출될 핸들러
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles((prevFiles) => [...prevFiles, ...newFiles]);

    // 같은 파일을 다시 선택해도 onChange가 발생하도록 value 초기화
    e.target.value = null;
  };

  // 5) 폼 제출 핸들러
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
      // FormData 사용
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());

      // name="imageFiles"로 서버에 보낼 때, 키가 여러 번 중복되면 배열 형태로 바인딩
      imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
      });

      const response = await axios.post(
        'http://localhost:8080/api/posts',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type은 생략: 브라우저가 자동으로 multipart/form-data로 세팅
          },
        }
      );

      const newPostId = response.data; // 반환된 게시글 ID
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

            {/* 7) 제목 입력 */}
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

            {/* 9) 내용 입력 */}
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

            {/* 9.1) 이미지 첨부 */}
            <label className="create-label" htmlFor="post-images">
              사진 첨부 (여러 장 가능)
            </label>
            <input
              id="post-images"
              type="file"
              name="imageFiles"        /* 백엔드의 DTO 필드명과 동일해야 합니다 */
              className="create-file-input"
              multiple                  /* 여러 장 선택 가능 */
              accept="image/*"
              onChange={handleFileChange}
            />
            {/* 9.2) 선택된 파일명 미리보기 */}
            {imageFiles.length > 0 && (
              <div className="selected-files">
                <strong>선택된 사진:</strong>{' '}
                {imageFiles
                  .map((file, idx) => file.name + (idx < imageFiles.length - 1 ? ', ' : ''))
                  .join('')}
              </div>
            )}

            {/* 10) 버튼 그룹 */}
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
