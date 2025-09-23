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

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/posts/${id}`)
      .then(res => {
        setTitle(res.data.title);
        setContent(res.data.content);
        setExistingImages(res.data.imageUrls || []);
      })
      .catch(err => {
        console.error('수정할 게시글 정보 로드 실패:', err);
        setError('게시글 정보를 불러오는 중 오류가 발생했습니다.');
      })
      .finally(() => setLoading(false));
  }, [id]);

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
      } else {
        alert('게시물 수정 중 오류가 발생했습니다.');
      }
    });
  };

  const handleCancel = () => navigate(`/community/${id}`);

  if (loading) return <div className="loading">로딩 중…</div>;
  if (error) return <div className="edit-error">{error}</div>;

  return (
    <div className="edit-background">
      <Header />

      <div className="community-edit-page">
        <h2 className="edit-title">게시글 수정</h2>
        <div className="edit-subtitle">기존 글을 수정합니다</div>

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

          <label className="edit-label">사진 첨부 (여러 장 가능)</label>
          <div className="edit-image-list">
            {existingImages.map((url, i) => (
              <div key={i} className="edit-image-item">
                <img src={`${API_BASE_URL}${url}`} alt={`thumb-${i}`} />
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
                key={fileInputKey.current}
                name="imageFiles"
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
      </div>

      <Footer />
    </div>
  );
}
