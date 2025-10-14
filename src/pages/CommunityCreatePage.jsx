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

  const [currentUserNickname, setCurrentUserNickname] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) { 
      setCurrentUserNickname(null); 
      return; 
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      setCurrentUserNickname(payload.nickname || payload.username || payload.sub);
    } catch {
      setCurrentUserNickname(null);
    }
  }, []);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleBack = () => navigate('/community');

  const handleFileChange = e => {
    const arr = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...arr]);
    fileInputKey.current += 1;
  };

  const removeNewFile = idx => {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.'); 
      return;
    }
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) { 
      setError('로그인이 필요합니다.'); 
      return; 
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      newFiles
        .filter(f => f instanceof File && f.name)
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
    <div className="create-page">
      <div className="grain-overlay" />
      <Header />

      <div className="create-container">
        <div className="create-header">
          <div className="header-content">
            <h1>새 게시글</h1>
            <p>커뮤니티에 글을 작성합니다</p>
          </div>
          <button className="btn-back-header" onClick={handleBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            취소
          </button>
        </div>

        {!currentUserNickname ? (
          <div className="login-prompt-card">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2"/>
              <circle cx="32" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 52C12 42.0589 20.0589 34 30 34H34C43.9411 34 52 42.0589 52 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>게시글을 작성하려면 로그인해주세요.</p>
          </div>
        ) : (
          <form className="create-form-card" onSubmit={handleSubmit}>
            {error && (
              <div className="error-msg">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 6V10M10 13V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="post-title">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                제목
              </label>
              <input
                id="post-title"
                type="text"
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="제목을 입력하세요..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="post-content">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 6H10M6 8H10M6 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                내용
              </label>
              <textarea
                id="post-content"
                className="form-textarea"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="내용을 입력하세요..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="5.5" cy="6.5" r="1" fill="currentColor"/>
                  <path d="M2 11L5 8L7 10L11 6L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                사진 첨부 <span className="label-optional">(선택사항, 여러 장 가능)</span>
              </label>
              <div className="image-gallery-create">
                {newFiles.map((file, i) => (
                  <div key={i} className="image-item">
                    <img src={URL.createObjectURL(file)} alt={`새로운-${i}`} />
                    <button 
                      type="button" 
                      className="image-remove-btn"
                      onClick={() => removeNewFile(i)}
                      aria-label="이미지 삭제"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
                <label className="image-upload-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="8" cy="9" r="1.5" fill="currentColor"/>
                    <path d="M3 16L8 11L11 14L16 9L21 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>이미지 추가</span>
                  <input
                    key={fileInputKey.current}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleBack}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                취소
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={!title.trim() || !content.trim()}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8L14 2L8 14L7 10L2 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
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