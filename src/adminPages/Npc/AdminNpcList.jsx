import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../AdminContent.css';
import './AdminNpcList.css';

function AdminNpcList() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const npcsPerPage = 20; // 5x4 그리드

  // NPC 데이터 불러오기
  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    axios
      .get(`${API_BASE_URL}/api/npcs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNpcs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // 검색 필터링 (id, name[], features[])
  const filtered = npcs.filter((npc) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();

    try {
      const names = Array.isArray(npc.name) ? npc.name : [];
      const features = Array.isArray(npc.features) ? npc.features : [];

      return (
        npc.id.toLowerCase().includes(searchLower) ||
        names.some((n) => n.toLowerCase().includes(searchLower)) ||
        features.some((f) => f.toLowerCase().includes(searchLower))
      );
    } catch {
      return false;
    }
  });

  // 페이징
  const totalPages = Math.ceil(filtered.length / npcsPerPage);
  const startIdx = (currentPage - 1) * npcsPerPage;
  const currentNpcs = filtered.slice(startIdx, startIdx + npcsPerPage);

  // NPC 클릭 핸들러
  const handleNpcClick = (npcId) => {
    navigate(`/admin/npcs/${npcId}`);
  };

  // NPC 이름 가져오기 (한글 우선)
  const getNpcName = (npc) => {
    if (!npc.name) return 'Unknown NPC';
    if (Array.isArray(npc.name)) {
      return npc.name[1] || npc.name[0] || 'Unknown NPC';
    }
    return npc.name;
  };

  // NPC 이미지 가져오기 (Cloudinary 우선)
  const getNpcImage = (npc) => {
    if (npc.imageUrl) {
      return npc.imageUrl;
    }
    return "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA0MjBfMjcy%2FMDAxNzEzNjE4MDk2NDMy.TJo5oSAsFzMeDKScAZZZWxLGY_Xj4QbTK_VPMcmgmrgg.MWbdnjNykHVl4kc0sv8hGD-Ju5GeaeCM5EmUmgKQcQsg.PNG%2F12.PNG&type=a340";
  };

  return (
    <div className="admin-content-section">
      <div className="admin-section-header">
        <div className="section-left">
          <h2 className="admin-section-title">NPC 관리</h2>
          <p className="section-description">
            게임 내 모든 NPC를 조회하고<br></br>  관리할 수 있습니다.
          </p>
        </div>
        
        {/* 검색 바 + 추가 버튼 */}
        <div className="search-controls">
          <input
            type="text"
            className="search-input"
            placeholder="NPC 검색 (이름, ID, 특징)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
          />
          <button className="search-button" onClick={() => setCurrentPage(1)}>
            검색
          </button>
          <button
            className="create-button"
            onClick={() => navigate('/admin/npcs/new')}
          >
            NPC 추가
          </button>
        </div>
      </div>

      {loading && <p className="loading-text">로딩 중...</p>}
      {error && <p className="error-text">에러 발생: {error.message}</p>}

      {!loading && !error && (
        <>
          {/* NPC 그리드 (5x4) */}
          <div className="npcs-grid">
            {currentNpcs.map((npc) => (
              <div
                key={npc.id}
                className="npc-card"
                onClick={() => handleNpcClick(npc.id)}
              >
                <div className="npc-image-wrapper">
                  <img
                    src={getNpcImage(npc)}
                    alt={getNpcName(npc)}
                    onError={(e) => {
                      e.target.src =
                        "https://i.namu.wiki/i/xpQatdbCF5G0mhclJgY0oNQU3UtAFhh8nL2McgZh1K-4i7a-IXgMN3BknUrnAq2Y6o7LQae2ZV7avX6Rt0MDiQ.webp";
                    }}
                  />
                </div>
                <div className="npc-info">
                  <div className="npc-id">{npc.id}</div>
                  <div className="npc-name">{getNpcName(npc)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이징 */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="page-button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? 'page-button active' : 'page-button'}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="page-button"
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
  );
}

export default AdminNpcList;