import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./AdminReportList.css";

function AdminReportList() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 상태 한글 매핑
  const statusLabels = {
    ALL: "전체",
    PENDING: "접수",
    IN_REVIEW: "확인 중",
    REJECTED: "기각",
    ACTION_TAKEN: "조치 완료",
    RESOLVED: "종결",
  };

  // 신고 사유 한글 매핑
  const reasonLabels = {
    SPAM: "스팸/광고",
    ABUSE: "욕설/혐오",
    HATE: "차별/혐오발언",
    SEXUAL: "성적 발언",
    ILLEGAL: "불법 행위",
    PERSONAL_INFO: "개인정보 노출",
    OTHER: "기타",
  };

  // 1) 신고 데이터 불러오기 (Authorization 헤더 포함)
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) {
      setError(new Error("로그인이 필요합니다."));
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/admin/reports/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setReports(res.data.content || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("신고 목록 요청 실패:", err);
        setError(err);
        setLoading(false);
      });
  }, [API_BASE_URL]);

  // 2) 필터링
  const filtered = reports.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  // 3) 클릭 시 상세 페이지 이동
  const handleClick = (id, type) => {
    navigate(`/admin/reports/${type.toLowerCase()}/${id}`);
  };

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <h2 className="admin-title">신고 관리</h2>

            {/* ─── 탭 네비게이션 ───────────────────────── */}
            <div className="admin-tabs">
              <button
                className={location.pathname === "/admin/users" ? "active" : ""}
                onClick={() => navigate("/admin/users")}
              >
                회원 관리
              </button>
              <button
                className={location.pathname === "/admin/items" ? "active" : ""}
                onClick={() => navigate("/admin/items")}
              >
                아이템 관리
              </button>
              <button
                className={location.pathname === "/admin/npcs" ? "active" : ""}
                onClick={() => navigate("/admin/npcs")}
              >
                NPC 관리
              </button>
              <button
                className={location.pathname === "/admin/skills" ? "active" : ""}
                onClick={() => navigate("/admin/skills")}
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

            {/* 상태 필터 */}
            <div className="report-filter">
              <label>상태 필터: </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* 로딩/에러 처리 */}
            {loading && <p className="loading">로딩 중...</p>}
            {error && (
              <p className="error-message">
                에러 발생:{" "}
                {error.response?.status === 403
                  ? "접근 권한이 없습니다. 관리자 계정으로 로그인하세요."
                  : error.message}
              </p>
            )}

            {/* 테이블 */}
            {!loading && !error && (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>유형</th>
                    <th>신고 대상</th>
                    <th>신고자</th>
                    <th>피신고자</th>
                    <th>사유</th>
                    <th>상태</th>
                    <th>작성일</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8">신고 내역이 없습니다.</td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} onClick={() => handleClick(r.id, r.type)}>
                        <td>{r.id}</td>
                        <td>{r.type === "POST" ? "게시글" : "댓글"}</td>
                        <td>
                          {r.type === "POST"
                            ? `[게시글] ${r.targetTitle}`
                            : `[댓글] ${r.targetContent?.slice(0, 30)}...`}
                        </td>
                        <td>{r.reporterNickname}</td>
                        <td>{r.reportedNickname}</td>
                        <td>
                          {Array.from(r.reasons)
                            .map((reason) => reasonLabels[reason] || reason)
                            .join(", ")}
                        </td>
                        <td>{statusLabels[r.status] || r.status}</td>
                        <td>{new Date(r.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminReportList;
