import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../AdminContent.css";
import "./AdminReportList.css";

function AdminReportList() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reportType, setReportType] = useState("posts"); // posts or comments
  const [activeTab, setActiveTab] = useState("reports"); // reports or appeals

  // 상태 한글 매핑
  const statusLabels = {
    ALL: "전체",
    PENDING: "접수",
    IN_REVIEW: "확인 중",
    REJECTED: "기각",
    ACTION_TAKEN: "조치 완료",
    RESOLVED: "종결",
  };

  // 이의신청 상태 한글 매핑
  const appealStatusLabels = {
    ALL: "전체",
    PENDING: "검토중",
    APPROVED: "승인",
    REJECTED: "기각",
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

  // 제재 유형 한글 매핑
  const penaltyTypeLabels = {
    WARNING: "경고",
    SUSPENSION: "정지",
    PERMANENT: "영구정지",
  };

  // 신고 데이터 불러오기
  useEffect(() => {
    if (activeTab === "reports") {
      loadReports();
    } else {
      loadAppeals();
    }
  }, [statusFilter, reportType, activeTab]);

  const loadReports = () => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) {
      setError(new Error("로그인이 필요합니다."));
      setLoading(false);
      return;
    }

    setLoading(true);

    const statusParam = statusFilter === "ALL" ? "" : `?statuses=${statusFilter}`;
    
    axios
      .get(`${API_BASE_URL}/api/admin/reports/${reportType}${statusParam}`, {
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
  };

  const loadAppeals = () => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) {
      setError(new Error("로그인이 필요합니다."));
      setLoading(false);
      return;
    }

    setLoading(true);

    const endpoint = statusFilter === "ALL" || statusFilter === "PENDING"
      ? `/api/admin/appeals${statusFilter === "PENDING" ? "/pending" : ""}`
      : `/api/admin/appeals`;

    axios
      .get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        let data = res.data || [];
        
        if (statusFilter !== "ALL" && statusFilter !== "PENDING") {
          data = data.filter(appeal => appeal.status === statusFilter);
        }
        
        setAppeals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("이의신청 목록 요청 실패:", err);
        setError(err);
        setLoading(false);
      });
  };

  // 클릭 시 상세 페이지 이동
  const handleReportClick = (id, type) => {
    navigate(`/admin/reports/${type.toLowerCase()}/${id}`);
  };

  const handleAppealClick = (id) => {
    navigate(`/admin/appeals/${id}`);
  };

  return (
    <div className="admin-content-section">
      <div className="admin-section-header-full">
        <h2 className="admin-section-title">신고 & 이의신청 관리</h2>
        <p className="section-description">
          회원 신고 내역과 제재에 대한 이의신청을 관리합니다.
        </p>
      </div>

      {/* 신고 / 이의신청 탭 */}
      <div className="content-tabs">
        <button
          className={activeTab === "reports" ? "active" : ""}
          onClick={() => {
            setActiveTab("reports");
            setStatusFilter("ALL");
          }}
        >
          📋 신고 관리
        </button>
        <button
          className={activeTab === "appeals" ? "active" : ""}
          onClick={() => {
            setActiveTab("appeals");
            setStatusFilter("ALL");
          }}
        >
          ⚖️ 이의신청 관리
        </button>
      </div>

      {/* 신고 관리 탭 */}
      {activeTab === "reports" && (
        <>
          {/* 신고 유형 선택 */}
          <div className="report-type-filter">
            <button
              className={reportType === "posts" ? "active" : ""}
              onClick={() => setReportType("posts")}
            >
              게시글 신고
            </button>
            <button
              className={reportType === "comments" ? "active" : ""}
              onClick={() => setReportType("comments")}
            >
              댓글 신고
            </button>
          </div>

          {/* 상태 필터 */}
          <div className="report-filter">
            <label>상태 필터: </label>
            <select
              className="search-select"
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

          {loading && <p className="loading-text">로딩 중...</p>}
          {error && (
            <p className="error-text">
              에러 발생:{" "}
              {error.response?.status === 403
                ? "접근 권한이 없습니다. 관리자 계정으로 로그인하세요."
                : error.message}
            </p>
          )}

          {!loading && !error && (
            <div className="table-wrapper">
              <table className="data-table report-table">
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
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan="8">신고 내역이 없습니다.</td>
                    </tr>
                  ) : (
                    reports.map((r) => (
                      <tr key={r.id} onClick={() => handleReportClick(r.id, r.reportType)}>
                        <td>{r.id}</td>
                        <td>{r.reportType === "POST" ? "게시글" : "댓글"}</td>
                        <td className="ellipsis-cell">
                          {r.reportType === "POST"
                            ? r.targetTitle || "제목 없음"
                            : r.targetContent || "내용 없음"}
                        </td>
                        <td className="ellipsis-cell">{r.reporterNickname}</td>
                        <td className="ellipsis-cell">{r.reportedNickname}</td>
                        <td className="ellipsis-cell">
                          {Array.from(r.reasons)
                            .map((reason) => reasonLabels[reason] || reason)
                            .join(", ")}
                        </td>
                        <td>
                          <span className={`status-badge ${r.status.toLowerCase()}`}>
                            {statusLabels[r.status] || r.status}
                          </span>
                        </td>
                        <td>{new Date(r.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* 이의신청 관리 탭 */}
      {activeTab === "appeals" && (
        <>
          {/* 상태 필터 */}
          <div className="report-filter">
            <label>상태 필터: </label>
            <select
              className="search-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {Object.entries(appealStatusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="loading-text">로딩 중...</p>}
          {error && (
            <p className="error-text">
              에러 발생:{" "}
              {error.response?.status === 403
                ? "접근 권한이 없습니다. 관리자 계정으로 로그인하세요."
                : error.message}
            </p>
          )}

          {!loading && !error && (
            <div className="table-wrapper">
              <table className="data-table report-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>제재 ID</th>
                    <th>회원</th>
                    <th>제재 유형</th>
                    <th>제재 사유</th>
                    <th>이의신청 사유</th>
                    <th>상태</th>
                    <th>신청일</th>
                  </tr>
                </thead>
                <tbody>
                  {appeals.length === 0 ? (
                    <tr>
                      <td colSpan="8">이의신청 내역이 없습니다.</td>
                    </tr>
                  ) : (
                    appeals.map((appeal) => (
                      <tr key={appeal.id} onClick={() => handleAppealClick(appeal.id)}>
                        <td>{appeal.id}</td>
                        <td>{appeal.penaltyId}</td>
                        <td className="ellipsis-cell">
                          <div>{appeal.memberNickname}</div>
                          <small style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                            @{appeal.memberUsername}
                          </small>
                        </td>
                        <td>
                          <span className={`penalty-badge ${appeal.penaltyType.toLowerCase()}`}>
                            {penaltyTypeLabels[appeal.penaltyType]}
                          </span>
                        </td>
                        <td className="ellipsis-cell">{appeal.penaltyReason}</td>
                        <td className="ellipsis-cell">{appeal.appealReason}</td>
                        <td>
                          <span className={`status-badge ${appeal.status.toLowerCase()}`}>
                            {appealStatusLabels[appeal.status]}
                          </span>
                        </td>
                        <td>{new Date(appeal.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminReportList;