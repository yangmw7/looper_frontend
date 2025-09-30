import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './AdminUserList.css';

function AdminUserList() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchField, setSearchField] = useState('username');
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // 1) 유저 데이터 불러오기
  useEffect(() => {
    const token = localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('accessToken');

    axios.get(`${API_BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const sorted = res.data.slice().sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );
      setUsers(sorted);
      setLoading(false);
    })
    .catch(err => {
      setError(err);
      setLoading(false);
    });
  }, []);

  // 2) 삭제 핸들러
  const handleDelete = (userId) => {
    if (!window.confirm('이 사용자를 정말 삭제하시겠습니까?')) return;
    const token = localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('accessToken');
    axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setUsers(prev => prev.filter(u => u.id !== userId));
    })
    .catch(err => {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    });
  };

  // 3) 검색 + 페이징
  const filtered = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const value = String(u[searchField] || '').toLowerCase();
    return value.includes(searchQuery.trim().toLowerCase());
  });
  const totalPages   = Math.ceil(filtered.length / itemsPerPage);
  const startIdx     = (currentPage - 1) * itemsPerPage;
  const currentUsers = filtered.slice(startIdx, startIdx + itemsPerPage);
  const handleSearch = () => setCurrentPage(1);

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <h2 className="admin-title">회원 관리</h2>
            
            {/* ─── 탭 네비게이션 추가 ───────────────────────── */}
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
            </div>

            {/* ─── 검색 바 ───────────────────────── */}
            <div className="admin-search">
              <select
                value={searchField}
                onChange={e => setSearchField(e.target.value)}
              >
                <option value="username">아이디</option>
                <option value="nickname">닉네임</option>
                <option value="email">이메일</option>
              </select>
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}>검색</button>
            </div>

            {loading && <p className="loading">로딩 중...</p>}
            {error   && <p className="error-message">에러 발생: {error.message}</p>}

            {!loading && !error && (
              <>
                {/* 테이블 */}
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>아이디</th>
                        <th>닉네임</th>
                        <th>이메일</th>
                        <th>역할</th>
                        <th>가입일자</th>
                        <th>삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map(u => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.username}</td>
                          <td>{u.nickname}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td>
                            {u.createdDate
                              ? new Date(u.createdDate).toLocaleString()
                              : '-'}
                          </td>
                          <td>
                            <button
                              className="delete-button"
                              disabled={u.role !== 'USER'}
                              onClick={() => handleDelete(u.id)}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이징 */}
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
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
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminUserList;
