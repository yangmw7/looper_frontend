import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AdminUserList.css';

function AdminUserList() {
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

    axios.get('http://localhost:8080/api/admin/users', {
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
    axios.delete(`http://localhost:8080/api/admin/users/${userId}`, {
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

            {/* ─── 검색 바 (커뮤니티와 동일하게) ───────────────────────── */}
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
