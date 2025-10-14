import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CommunityEditPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CommunityEditPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputKey = useRef(0);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentUserNickname, setCurrentUserNickname] = useState(null);
  const [postAuthor, setPostAuthor] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate(`/community/${id}`);
      return;
    }

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
    } catch {
      setCurrentUserNickname(null);
    }
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/posts/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setExistingImages(res.data.imageUrls || []);
        setPostAuthor(res.data.writer);

        if (currentUserNickname && res.data.writer !== currentUserNickname) {
          alert('작성자만 수정할 수 있습니다.');
          navigate(`/community/${id}`);
        }
      })
      .catch(err => {
        console.error('수정할 게시글 정보 로드 실패:', err);
        setError('게시글 정보를 불러오는 중 오류가 발생했습니다.');
      })
      .finally(() => setLoading(false));
  }, [id, currentUserNickname]);

  const handleFileChange = e => {
    const filesArr = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...filesArr]);
    e.target.value = null;
    fileInputKey.current += 1;
  };

  const removeExistingImage = url => {
    setExistingImages(prev => prev.filter(u => u !== url));
  };

  const removeNewFile = idx => {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    existingImages.forEach(u => formData.append('keepImageUrls', u));
    newFiles.forEach(f => formData.append('imageFiles', f));

    axios.put(
      `${API_BASE_URL}/api/posts/${id}`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then(() => {
      alert('게시물이 성공적으로 수정되었습니다.');
      navigate(`/community/${id}`);
    })
    .catch(err => {
      console.error('게시글 수정 실패:', err);
      if (err.response?.status === 403) {
        alert('수정 권한이 없습니다.');
        navigate(`/community/${id}`);
      } else {
        alert('게시물 수정 중 오류가 발생했습니다.');
      }
    });
  };

  const handleCancel = () => navigate(`/community/${id}`);

  if (loading) {
    return (
      <div className="edit-page">
        <div className="grain-overlay" />
        <Header />
        <div className="edit-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>게시글을 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-page">
        <div className="grain-overlay" />
        <Header />
        <div className="edit-container">
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

  return (
    <div className="edit-page">
      <div className="grain-overlay" />
      <Header />

      <div className="edit-container">
        <div className="edit-header">
          <div className="header-content">
            <h1>게시글 수정</h1>
            <p>기존 글을 수정합니다</p>
          </div>
          <button className="btn-back-header" onClick={handleCancel}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            취소
          </button>
        </div>

        <form className="edit-form-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              제목
            </label>
            <input
              id="title"
              className="form-input"
              type="text"
              placeholder="제목을 입력하세요..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="content">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 6H10M6 8H10M6 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              내용
            </label>
            <textarea
              id="content"
              className="form-textarea"
              placeholder="내용을 입력하세요..."
              value={content}
              onChange={e => setContent(e.target.value)}
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
            <div className="image-gallery-edit">
              {existingImages.map((url, i) => {
                const transformedUrl = url.replace('/upload/', '/upload/w_400,q_auto,f_auto/');
                return (
                  <div key={i} className="image-item">
                    <img src={transformedUrl} alt={`기존-${i}`} />
                    <button 
                      type="button" 
                      className="image-remove-btn"
                      onClick={() => removeExistingImage(url)}
                      aria-label="이미지 삭제"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
              {newFiles.map((file, i) => (
                <div key={`new-${i}`} className="image-item">
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
                  name="imageFiles"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
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
                <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              수정 완료
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}