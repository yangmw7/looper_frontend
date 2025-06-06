// src/pages/CommunityEditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// **import 경로는 CommunityCreatePage.css 위치로 맞춰주세요**
import './CommunityCreatePage.css';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CommunityEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 게시물 데이터
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ──────────────────────────────────────────────────────
  // 1) 마운트 시 게시글 원본을 불러와서 폼에 채워넣기
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/posts/${id}`)
      .then((res) => {
        const data = res.data;
        setTitle(data.title);
        setContent(data.content);
        setLoading(false);
      })
      .catch((err) => {
        console.error('수정할 게시글 정보 로드 실패:', err);
        setError('게시글 정보를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      });
  }, [id]);

  // ──────────────────────────────────────────────────────
  // 2) 수정 폼 제출
  const handleSubmit = (e) => {
    e.preventDefault();

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    axios
      .put(
        `http://localhost:8080/api/posts/${id}`,
        { title: title.trim(), content: content.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert('게시물이 성공적으로 수정되었습니다.');
        navigate(`/community/${id}`);
      })
      .catch((err) => {
        console.error('게시글 수정 실패:', err);
        if (err.response?.status === 403) {
          alert('수정 권한이 없습니다.');
        } else {
          alert('게시물 수정 중 오류가 발생했습니다.');
        }
      });
  };

  // ──────────────────────────────────────────────────────
  // 3) 취소 버튼 → 상세 페이지로 복귀
  const handleCancel = () => {
    navigate(`/community/${id}`);
  };

  return (
    <div className="create-background">
      <Header />

      <div className="create-page">
        <h2 className="create-title">게시글 수정</h2>
        <div className="create-subtitle">기존 글을 수정합니다</div>

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="create-error">{error}</div>
        ) : (
          <form className="create-form" onSubmit={handleSubmit}>
            {/* 제목 입력 */}
            <label className="create-label" htmlFor="title">
              제목
            </label>
            <input
              id="title"
              className="create-input"
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* 내용 입력 */}
            <label className="create-label" htmlFor="content">
              내용
            </label>
            <textarea
              id="content"
              className="create-textarea"
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>

            {/* 버튼 그룹 */}
            <div className="create-button-group">
              <button
                type="button"
                className="btn-create-back"
                onClick={handleCancel}
              >
                취소
              </button>
              <button type="submit" className="btn-create-submit">
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
