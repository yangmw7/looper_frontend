// src/pages/AnnouncementWritePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaHeading, FaList, FaThumbtack, FaFileAlt, FaImage, FaTimes, FaSave, FaBan } from 'react-icons/fa';
import './AnnouncementWritePage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AnnouncementWritePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('NOTICE');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  // 관리자 체크 (더 명확하게)
  function checkAdminRole() {
    try {
      const roles = JSON.parse(localStorage.getItem('roles') || '[]');
      const isAdminRole = roles.includes('ROLE_ADMIN') || 
                          roles.includes('ADMIN') ||
                          roles.some(role => role.authority === 'ROLE_ADMIN');
      
      console.log('🔐 [WritePage] 관리자 권한 체크:', isAdminRole);
      return isAdminRole;
    } catch (err) {
      console.error('권한 체크 실패:', err);
      return false;
    }
  }

  const isAdmin = checkAdminRole();

  // 권한 체크 및 데이터 로드
  useEffect(() => {
    if (!isAdmin) {
      console.warn('⚠️ 관리자 권한 없음 - 접근 거부');
      alert('관리자만 접근 가능합니다.');
      navigate('/announcement');
      return;
    }

    if (id) {
      setIsEdit(true);
      console.log('✏️ 수정 모드 - 공지사항 ID:', id);
      fetchAnnouncement();
    } else {
      console.log('➕ 작성 모드');
    }
  }, [id, isAdmin, navigate]);

  // 수정 모드: 기존 공지사항 불러오기
  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/announcements/${id}`);
      const data = response.data;
      
      console.log('📄 불러온 공지사항:', {
        id: data.id,
        title: data.title,
        writer: data.writer,
        category: data.category
      });
      
      setTitle(data.title);
      setCategory(data.category);
      setContent(data.content);
      setIsPinned(data.isPinned);
      setExistingImages(data.imageUrls || []);
    } catch (err) {
      console.error('❌ 공지사항 불러오기 실패:', err);
      setError('공지사항을 불러오는데 실패했습니다.');
      setTimeout(() => navigate('/announcement'), 2000);
    } finally {
      setLoading(false);
    }
  };

  // 이미지 업로드
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = (existingImages?.length || 0) + images.length + files.length;
    
    if (totalImages > 5) {
      alert('이미지는 최대 5개까지 업로드 가능합니다.');
      return;
    }
    
    console.log('🖼️ 이미지 추가:', files.length, '개');
    setImages([...images, ...files]);
  };

  // 이미지 삭제 (신규)
  const handleRemoveImage = (index) => {
    console.log('🗑️ 신규 이미지 삭제:', index);
    setImages(images.filter((_, i) => i !== index));
  };

  // 기존 이미지 삭제
  const handleRemoveExistingImage = (url) => {
    console.log('🗑️ 기존 이미지 삭제:', url);
    setExistingImages(existingImages.filter((img) => img !== url));
  };

  // 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/auth');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('isPinned', isPinned);

    // 이미지 파일 추가
    images.forEach((image, index) => {
      console.log(`📎 이미지 ${index + 1} 추가:`, image.name);
      formData.append('imageFiles', image);
    });

    // 수정 시: 유지할 기존 이미지 URL
    if (isEdit) {
      existingImages.forEach((url, index) => {
        console.log(`🔗 기존 이미지 ${index + 1} 유지:`, url);
        formData.append('keepImageUrls', url);
      });
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };

      if (isEdit) {
        console.log(`✏️ 공지사항 수정 요청 - ID: ${id}`);
        await axios.put(`${API_BASE_URL}/api/announcements/${id}`, formData, config);
        console.log('✅ 수정 완료');
        alert('수정되었습니다.');
      } else {
        console.log('➕ 공지사항 작성 요청');
        await axios.post(`${API_BASE_URL}/api/announcements`, formData, config);
        console.log('✅ 작성 완료');
        alert('공지사항이 등록되었습니다.');
      }

      navigate('/announcement');
    } catch (err) {
      console.error('❌ 등록/수정 실패:', err.response?.data || err.message);
      
      if (err.response?.status === 401) {
        alert('로그인이 만료되었습니다.');
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        navigate('/auth');
      } else if (err.response?.status === 403) {
        alert('권한이 없습니다. 관리자만 작성/수정할 수 있습니다.');
        navigate('/announcement');
      } else {
        alert(isEdit ? '수정에 실패했습니다.' : '등록에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 권한 없으면 아무것도 렌더링하지 않음
  if (!isAdmin) return null;

  return (
    <div className="announcement-write-page">
      <div className="grain-overlay" />
      <Header />
      
      <div className="write-container">
        <div className="write-header">
          <h1>{isEdit ? '공지사항 수정' : '공지사항 작성'}</h1>
          <p className="admin-badge">🛡️ 관리자 전용</p>
        </div>

        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 6V10M10 13V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>처리 중...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="write-form">
            {/* 제목 */}
            <div className="form-group">
              <label>
                <FaHeading /> 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                required
                maxLength={100}
              />
            </div>

            {/* 카테고리 */}
            <div className="form-group">
              <label>
                <FaList /> 카테고리
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="NOTICE">공지</option>
                <option value="EVENT">이벤트</option>
                <option value="UPDATE">업데이트</option>
                <option value="MAINTENANCE">점검</option>
              </select>
            </div>

            {/* 상단 고정 */}
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
                <FaThumbtack /> 상단 고정
              </label>
            </div>

            {/* 내용 */}
            <div className="form-group">
              <label>
                <FaFileAlt /> 내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows="15"
                required
              />
            </div>

            {/* 기존 이미지 (수정 모드) */}
            {isEdit && existingImages.length > 0 && (
              <div className="form-group">
                <label>
                  <FaImage /> 기존 이미지
                </label>
                <div className="image-preview-grid">
                  {existingImages.map((url, index) => (
                    <div key={index} className="image-preview">
                      <img src={url} alt={`기존 이미지 ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(url)}
                        className="remove-image-btn"
                        title="이미지 삭제"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 이미지 업로드 */}
            <div className="form-group">
              <label>
                <FaImage /> 이미지 업로드 (최대 5개)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={((existingImages?.length || 0) + images.length) >= 5}
              />
              {images.length > 0 && (
                <div className="image-preview-grid">
                  {images.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img src={URL.createObjectURL(image)} alt={`미리보기 ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="remove-image-btn"
                        title="이미지 삭제"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/announcement')} 
                className="cancel-btn"
                disabled={loading}
              >
                <FaBan /> 취소
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                <FaSave /> {loading ? '처리 중...' : (isEdit ? '수정' : '등록')}
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
}