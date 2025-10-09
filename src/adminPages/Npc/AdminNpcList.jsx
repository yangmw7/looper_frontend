import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './AdminNpcList.css';

function AdminNpcList() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const npcsPerPage = 20; // 5x4 그리드

  // 1) NPC 데이터 불러오기
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

  // 2) 검색 필터링 (id, name[], features[])
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

  // 3) 페이징
  const totalPages = Math.ceil(filtered.length / npcsPerPage);
  const startIdx = (currentPage - 1) * npcsPerPage;
  const currentNpcs = filtered.slice(startIdx, startIdx + npcsPerPage);

  // 4) NPC 클릭 핸들러
  const handleNpcClick = (npcId) => {
    navigate(`/admin/npcs/${npcId}`);
  };

  // 5) NPC 이름 가져오기 (한글 우선)
  const getNpcName = (npc) => {
    if (!npc.name) return 'Unknown NPC';
    if (Array.isArray(npc.name)) {
      return npc.name[1] || npc.name[0] || 'Unknown NPC';
    }
    return npc.name;
  };

  // ✅ 6) NPC 이미지 가져오기 (Cloudinary 우선)
  const getNpcImage = (npc) => {
    if (npc.imageUrl) {
      return npc.imageUrl; // Cloudinary 이미지 URL 사용
    }
    // 기본 이미지
    return "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA0MjBfMjcy%2FMDAxNzEzNjE4MDk2NDMy.TJo5oSAsFzMeDKScAZZZWxLGY_Xj4QbTK_VPMcmgmrgg.MWbdnjNykHVl4kc0sv8hGD-Ju5GeaeCM5EmUmgKQcQsg.PNG%2F12.PNG&type=a340";
  };

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <h2 className="admin-title">NPC 관리</h2>

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
                placeholder="NPC 검색 (이름, ID, 특징)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
              />
              <button onClick={() => setCurrentPage(1)}>검색</button>
              <button
                className="create-button"
                onClick={() => navigate('/admin/npcs/new')}
              >
                NPC 추가
              </button>
            </div>

            {loading && <p className="loading">로딩 중...</p>}
            {error && <p className="error-message">에러 발생: {error.message}</p>}

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

export default AdminNpcList;
