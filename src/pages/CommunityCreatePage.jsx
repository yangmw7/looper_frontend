import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CommunityCreatePage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CommunityCreatePage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const fileInputKey = useRef(0);

  // JWT 토큰에서 현재 사용자의 닉네임 추출
  const [currentUserNickname, setCurrentUserNickname] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) { setCurrentUserNickname(null); return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      setCurrentUserNickname(payload.nickname || payload.username || payload.sub);
    } catch {
      setCurrentUserNickname(null);
    }
  }, []);

  // 입력 상태 관리
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState(null);

  // 뒤로 가기
  const handleBack = () => navigate('/community');

  // 파일 변경 핸들러 (선택 파일 미리보기)
  const handleFileChange = e => {
    const arr = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...arr]);
    fileInputKey.current += 1;
  };

  // 선택 해제
  const removeNewFile = idx => {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // 제출
  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.'); return;
    }
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) { setError('로그인이 필요합니다.'); return; }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
       // 실제로 사용자 선택 파일이 있을 때만 append
       newFiles
        .filter(f => f instanceof File && f.name)  // 이름이 있는 진짜 File만
        .forEach(f => formData.append('imageFiles', f));

      const res = await axios.post(
        `${API_BASE_URL}/api/posts`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/community/${res.data}`);
    } catch (err) {
      console.error(err);
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
          <div className="create-login-prompt">게시글을 작성하려면 로그인해주세요.</div>
        ) : (
          <form className="create-form" onSubmit={handleSubmit}>
            {error && <div className="create-error">{error}</div>}

            <label className="create-label" htmlFor="post-title">제목</label>
            <input
              id="post-title"
              type="text"
              className="create-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
            />

            <label className="create-label" htmlFor="post-content">내용</label>
            <textarea
              id="post-content"
              className="create-textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={10}
            />

            <label className="create-label">사진 첨부 (여러 장 가능)</label>
            <div className="create-image-list">
              {newFiles.map((file, i) => (
                <div key={i} className="create-image-item">
                  <img src={URL.createObjectURL(file)} alt={`new-${i}`} />
                  <button type="button" onClick={() => removeNewFile(i)}>×</button>
                </div>
              ))}
              <label className="create-file-picker">
                파일 선택
                <input
                  key={fileInputKey.current}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="create-button-group">
              <button type="button" className="btn-create-back" onClick={handleBack}>취소</button>
              <button type="submit" className="btn-create-submit">게시글 등록</button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
}
