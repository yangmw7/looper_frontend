// src/pages/CommunityEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CommunityEditPage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CommunityEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 폼 상태
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [existingImages, setExistingImages] = useState([]);  // 이미 업로드된 이미지 URL 리스트
  const [newFiles, setNewFiles] = useState([]);             // 추가할 새 파일들
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/posts/${id}`)
      .then(res => {
        const data = res.data;
        setTitle(data.title);
        setContent(data.content);
        setExistingImages(data.imageUrls || []);
      })
      .catch(err => {
        console.error('수정할 게시글 정보 로드 실패:', err);
        setError('게시글 정보를 불러오는 중 오류가 발생했습니다.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleFileChange = e => {
    // 새로 선택된 파일들만 추가
    setNewFiles(prev => [...prev, ...Array.from(e.target.files)]);
    e.target.value = '';
  };

  const removeExistingImage = url => {
    setExistingImages(prev => prev.filter(u => u !== url));
  };

  const removeNewFile = idx => {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = e => {
    e.preventDefault();

    const token = localStorage.getItem('accessToken')
                || sessionStorage.getItem('accessToken');
    if (!token) { alert('로그인이 필요합니다.'); return; }

    // Multipart form data 준비
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    existingImages.forEach(url => formData.append('keepImageUrls', url));
    newFiles.forEach(file => formData.append('imageFiles', file));

    axios.put(
      `http://localhost:8080/api/posts/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      }
    )
    .then(() => {
      alert('게시물이 성공적으로 수정되었습니다.');
      navigate(`/community/${id}`);
    })
    .catch(err => {
      console.error('게시글 수정 실패:', err);
      if (err.response?.status === 403) {
        alert('수정 권한이 없습니다.');
      } else {
        alert('게시물 수정 중 오류가 발생했습니다.');
      }
    });
  };

  const handleCancel = () => navigate(`/community/${id}`);

  return (
    <div className="create-background">
      <Header />

      <div className="community-edit-page">
        <h2 className="edit-title">게시글 수정</h2>
        <div className="edit-subtitle">기존 글을 수정합니다</div>

        {loading
          ? <div className="loading">로딩 중...</div>
          : error
            ? <div className="edit-error">{error}</div>
            : (
          <form className="edit-form" onSubmit={handleSubmit}>
            <label className="edit-label" htmlFor="title">제목</label>
            <input
              id="title"
              className="edit-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />

            <label className="edit-label" htmlFor="content">내용</label>
            <textarea
              id="content"
              className="edit-textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />

            {/*  이미지 섹션  */}
            <label className="edit-label">사진 첨부 (여러 장 가능)</label>
            <div className="edit-image-list">
              {existingImages.map((url, i) => (
                <div key={i} className="edit-image-item">
                  <img src={`http://localhost:8080${url}`} alt={`thumb-${i}`} />
                  <button type="button" onClick={() => removeExistingImage(url)}>×</button>
                </div>
              ))}
              {newFiles.map((file, i) => (
                <div key={`new-${i}`} className="edit-image-item">
                  <img src={URL.createObjectURL(file)} alt={`new-${i}`} />
                  <button type="button" onClick={() => removeNewFile(i)}>×</button>
                </div>
              ))}
              <label className="edit-file-picker">
                파일 선택
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="edit-button-group">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                취소
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={!title.trim() || !content.trim()}
              >
                수정 완료
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}
