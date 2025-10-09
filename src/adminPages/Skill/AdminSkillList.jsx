// src/adminPages/Skill/AdminSkillList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './AdminSkillList.css';

function AdminSkillList() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const skillsPerPage = 20; // 5x4 그리드

  // 1) 스킬 데이터 불러오기
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/skills`)
      .then((res) => {
        setSkills(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  // 2) 검색 필터링 (id, name[], description[])
  const filtered = skills.filter((skill) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();

    try {
      const names = Array.isArray(skill.name) ? skill.name : [];
      const descs = Array.isArray(skill.description) ? skill.description : [];

      return (
        (skill.id && skill.id.toLowerCase().includes(searchLower)) ||
        names.some((n) => n && n.toLowerCase().includes(searchLower)) ||
        descs.some((d) => d && d.toLowerCase().includes(searchLower))
      );
    } catch {
      return false;
    }
  });

  // 3) 페이징
  const totalPages = Math.ceil(filtered.length / skillsPerPage);
  const startIdx = (currentPage - 1) * skillsPerPage;
  const currentSkills = filtered.slice(startIdx, startIdx + skillsPerPage);

  // 4) 스킬 클릭 핸들러
  const handleSkillClick = (skillId) => {
    navigate(`/admin/skills/${skillId}`);
  };

  // 5) 스킬 이름 (한글 우선 표시)
  const getSkillName = (skill) => {
    if (!skill.name) return 'Unknown Skill';
    if (Array.isArray(skill.name)) {
      return skill.name[1] || skill.name[0] || 'Unknown Skill';
    }
    return skill.name; // 혹시 문자열로 내려오면 그대로 출력
  };

  // 6) 스킬 이미지 (임시)
  const getSkillImage = () => {
    return "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMTEyMTZfNDAg%2FMDAxNjM5NjQxNzUxMDc5.8Z45VaLbczbt6T0CnwI5852sOiWcu9zqPby1vdSSVJ0g.wFZHYWgSfK9TsAXqEPG71DPVaz1USCDCw0aImGSBhAcg.PNG.glory8743%2F1231312.png&type=sc960_832";
  };

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <h2 className="admin-title">스킬 관리</h2>

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
                placeholder="스킬 검색 (이름, ID, 설명)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
              />
              <button onClick={() => setCurrentPage(1)}>검색</button>
              <button
                className="create-button"
                onClick={() => navigate('/admin/skills/new')}
              >
                스킬 추가
              </button>
            </div>

            {loading && <p className="loading">로딩 중...</p>}
            {error && <p className="error-message">에러 발생: {error.message}</p>}

            {!loading && !error && (
              <>
                {/* 스킬 그리드 (5x4) */}
                <div className="skills-grid">
                  {currentSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="skill-card"
                      onClick={() => handleSkillClick(skill.id)}
                    >
                      <div className="skill-image-wrapper">
                        <img
                          src={getSkillImage(skill.id)}
                          alt={getSkillName(skill)}
                          onError={(e) => {
                            e.target.src =
                              'https://cdn-icons-png.flaticon.com/512/616/616408.png';
                          }}
                        />
                      </div>
                      <div className="skill-info">
                        <div className="skill-id">{skill.id}</div>
                        <div className="skill-name">{getSkillName(skill)}</div>
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

export default AdminSkillList;
