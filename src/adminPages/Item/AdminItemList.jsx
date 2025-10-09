// src/adminPages/Item/AdminItemList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './AdminItemList.css';

function AdminItemList() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 20; // 5x4 그리드

  // 1) 아이템 데이터 불러오기
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    axios
      .get(`${API_BASE_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setItems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // 2) 검색 필터링 (name, description은 배열)
  const filtered = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();

    try {
      const names = Array.isArray(item.name) ? item.name : [];
      const descriptions = Array.isArray(item.description)
        ? item.description
        : [];

      return (
        names.some((n) => n.toLowerCase().includes(searchLower)) ||
        descriptions.some((d) => d.toLowerCase().includes(searchLower)) ||
        item.id.toLowerCase().includes(searchLower)
      );
    } catch {
      return false;
    }
  });

  // 3) 페이징
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIdx, startIdx + itemsPerPage);

  // 4) 아이템 클릭 핸들러
  const handleItemClick = (itemId) => {
    navigate(`/admin/items/${itemId}`);
  };

  // 5) 아이템 이름 가져오기 (한글 우선)
  const getItemName = (item) => {
    if (!item.name) return 'Unknown Item';
    if (Array.isArray(item.name)) {
      return item.name[1] || item.name[0] || 'Unknown Item';
    }
    return item.name; // 문자열일 경우 fallback
  };

  // 6) 아이템 이미지 경로 생성 - 구글 드라이브 URL 사용
  const getItemImage = (item) => {
    // imageUrl이 있으면 사용, 없으면 기본 이미지
    if (item.imageUrl) {
      return item.imageUrl;
    }
    return "https://search.pstatic.net/sunny/?src=https%3A%2F%2Fi.namu.wiki%2Fi%2F77y-ptU__gqfagWpDS4YmvNGvE2tAbwFwUN0KZDYI2mbuReEb5AbFhK-3pZbswXTX3l4vii0pdQRgoJG35lHZg.webp&type=sc960_832";
  };

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <h2 className="admin-title">아이템 관리</h2>

            {/* ─── 탭 네비게이션 ───────────────────────── */}
            <div className="admin-tabs">
              <button
                className={location.pathname === '/admin/users' ? 'active' : ''}
                onClick={() => navigate('/admin/users')}
              >
                회원 관리
              </button>
              <button
                className={location.pathname === '/admin/items' ? 'active' : ''}
                onClick={() => navigate('/admin/items')}
              >
                아이템 관리
              </button>
              <button
                className={location.pathname === '/admin/npcs' ? 'active' : ''}
                onClick={() => navigate('/admin/npcs')}
              >
                NPC 관리
              </button>
              <button
                className={location.pathname === '/admin/skills' ? 'active' : ''}
                onClick={() => navigate('/admin/skills')}
              >
                스킬 관리
              </button>
              <button
                className={location.pathname.startsWith("/admin/reports") ? "active" : ""}
                onClick={() => navigate("/admin/reports")}
              >
                신고 관리
              </button>
            </div>

            {/* ─── 검색 바 + 추가 버튼 ───────────────────────── */}
            <div className="admin-search">
              <input
                type="text"
                placeholder="아이템 검색 (이름, ID)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
              />
              <button onClick={() => setCurrentPage(1)}>검색</button>
              <button
                className="create-button"
                onClick={() => navigate('/admin/items/new')}
              >
                아이템 추가
              </button>
            </div>

            {loading && <p className="loading">로딩 중...</p>}
            {error && (
              <p className="error-message">에러 발생: {error.message}</p>
            )}

            {!loading && !error && (
              <>
                {/* 아이템 그리드 (5x4) */}
                <div className="items-grid">
                  {currentItems.map((item) => (
                    <div
                      key={item.id}
                      className="item-card"
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="item-image-wrapper">
                        <img
                          src={getItemImage(item)}
                          alt={getItemName(item)}
                          onError={(e) => {
                            e.target.src =
                              "https://search.pstatic.net/sunny/?src=https%3A%2F%2Fi.namu.wiki%2Fi%2F77y-ptU__gqfagWpDS4YmvNGvE2tAbwFwUN0KZDYI2mbuReEb5AbFhK-3pZbswXTX3l4vii0pdQRgoJG35lHZg.webp&type=sc960_832";
                          }}
                        />
                        <div className={`item-rarity ${item.rarity}`}>
                          {item.rarity}
                        </div>
                      </div>
                      <div className="item-info">
                        <div className="item-id">{item.id}</div>
                        <div className="item-name">{getItemName(item)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 페이징 */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={currentPage === i + 1 ? 'active' : ''}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminItemList;