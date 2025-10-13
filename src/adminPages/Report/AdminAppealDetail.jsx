import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./AdminReportDetail.css";

function AdminAppealDetail() {
  const { id } = useParams(); // /admin/appeals/5
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [appeal, setAppeal] = useState(null);
  const [decision, setDecision] = useState(""); // "approve" or "reject"
  const [adminResponse, setAdminResponse] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 제재 유형 매핑
  const penaltyTypeLabels = {
    WARNING: "경고",
    SUSPENSION: "정지",
    PERMANENT: "영구정지",
  };

  // 이의신청 상태 매핑
  const appealStatusLabels = {
    PENDING: "검토중",
    APPROVED: "승인",
    REJECTED: "기각",
  };

  // ✅ 이의신청 상세 데이터 요청
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) {
      setError("관리자 로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/admin/appeals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const foundAppeal = res.data.find((a) => a.id === parseInt(id));
        if (foundAppeal) {
          setAppeal(foundAppeal);
        } else {
          setError("이의신청을 찾을 수 없습니다.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("이의신청 상세 요청 실패:", err);
        if (err.response?.status === 403)
          setError("접근 권한이 없습니다. 관리자 계정으로 로그인하세요.");
        else setError("이의신청 데이터를 불러오는 중 오류 발생");
        setLoading(false);
      });
  }, [API_BASE_URL, id]);

  // ✅ 이의신청 처리
  const handleProcess = () => {
    if (!decision) {
      alert("승인 또는 거부를 선택해주세요.");
      return;
    }

    if (!adminResponse.trim()) {
      alert("관리자 답변을 입력해주세요.");
      return;
    }

    if (!confirm(`이의신청을 ${decision === "approve" ? "승인" : "거부"}하시겠습니까?`)) {
      return;
    }

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    const requestData = {
      approve: decision === "approve",
      adminResponse: adminResponse.trim(),
    };

    axios
      .post(
        `${API_BASE_URL}/api/admin/appeals/${id}/process`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("이의신청 처리가 완료되었습니다.");
        navigate("/admin/reports");
      })
      .catch((err) => {
        console.error("이의신청 처리 실패:", err);
        alert(
          "이의신청 처리 중 오류 발생: " +
            (err.response?.data?.message || err.message)
        );
      });
  };

  if (loading) return <p className="loading">로딩 중...</p>;
  if (error) return <p className="error-message">에러: {error}</p>;
  if (!appeal) return <p className="error-message">데이터를 찾을 수 없습니다.</p>;

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <h2 className="admin-title">이의신청 상세 & 처리</h2>

            {/* ─── 제재 정보 ─────────────────────────── */}
            <div className="report-detail-box">
              <h3>🚨 원본 제재 정보</h3>
              <p>
                <b>제재 ID:</b> {appeal.penaltyId}
              </p>
              <p>
                <b>회원:</b> {appeal.memberNickname} (@{appeal.memberUsername})
              </p>
              <p>
                <b>제재 유형:</b>{" "}
                <span
                  className={`penalty-badge ${appeal.penaltyType.toLowerCase()}`}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  {penaltyTypeLabels[appeal.penaltyType]}
                </span>
              </p>
              <p>
                <b>제재 사유:</b> {appeal.penaltyReason}
              </p>
              <p>
                <b>제재 기간:</b>{" "}
                {new Date(appeal.penaltyStartDate).toLocaleDateString()} ~{" "}
                {appeal.penaltyEndDate
                  ? new Date(appeal.penaltyEndDate).toLocaleDateString()
                  : "영구"}
              </p>
            </div>

            {/* ─── 이의신청 내용 ─────────────────────────── */}
            <div className="report-detail-box">
              <h3>📝 이의신청 내용</h3>
              <p>
                <b>이의신청 ID:</b> {appeal.id}
              </p>
              <p>
                <b>신청 일시:</b> {new Date(appeal.createdAt).toLocaleString()}
              </p>
              <p>
                <b>처리 상태:</b>{" "}
                <span
                  className={`status-badge ${appeal.status.toLowerCase()}`}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  {appealStatusLabels[appeal.status]}
                </span>
              </p>
              <p>
                <b>이의신청 사유:</b>
              </p>
              <pre
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "16px",
                  borderRadius: "8px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {appeal.appealReason}
              </pre>

              {appeal.status !== "PENDING" && (
                <>
                  <p>
                    <b>처리자:</b> {appeal.processedBy}
                  </p>
                  <p>
                    <b>처리 일시:</b> {new Date(appeal.processedAt).toLocaleString()}
                  </p>
                  <p>
                    <b>관리자 답변:</b>
                  </p>
                  <pre
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      padding: "16px",
                      borderRadius: "8px",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.6",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    {appeal.adminResponse}
                  </pre>
                </>
              )}
            </div>

            {/* ─── 이의신청 처리 (PENDING 상태일 때만) ─────────────────────────── */}
            {appeal.status === "PENDING" && (
              <div className="report-actions">
                <h3>⚖️ 이의신청 처리</h3>

                <div className="form-group">
                  <label>처리 결정:</label>
                  <div className="decision-buttons">
                    <button
                      className={`decision-btn approve ${
                        decision === "approve" ? "active" : ""
                      }`}
                      onClick={() => setDecision("approve")}
                    >
                      ✅ 승인 (제재 해제)
                    </button>
                    <button
                      className={`decision-btn reject ${
                        decision === "reject" ? "active" : ""
                      }`}
                      onClick={() => setDecision("reject")}
                    >
                      ❌ 거부 (제재 유지)
                    </button>
                  </div>
                </div>

                {decision && (
                  <div className="form-group">
                    <label>관리자 답변:</label>
                    <textarea
                      placeholder={
                        decision === "approve"
                          ? "승인 사유를 입력하세요. 예: 검토 결과 부적절한 제재로 판단되어 승인합니다."
                          : "거부 사유를 입력하세요. 예: 제재 사유가 타당하여 이의신청을 기각합니다."
                      }
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows="5"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "#fff",
                        fontSize: "0.95rem",
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                    />
                  </div>
                )}

                <div className="action-buttons">
                  <button
                    className="admin-btn-primary"
                    onClick={handleProcess}
                    disabled={!decision || !adminResponse.trim()}
                    style={{
                      opacity: !decision || !adminResponse.trim() ? 0.5 : 1,
                      cursor:
                        !decision || !adminResponse.trim()
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {decision === "approve" ? "✅ 승인하기" : "❌ 거부하기"}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => navigate("/admin/reports")}
                  >
                    ← 목록으로
                  </button>
                </div>
              </div>
            )}

            {/* ─── 이미 처리된 경우 ─────────────────────────── */}
            {appeal.status !== "PENDING" && (
              <div className="report-actions">
                <p style={{ textAlign: "center", fontSize: "1.1rem", color: "rgba(255,255,255,0.7)" }}>
                  이 이의신청은 이미 처리되었습니다.
                </p>
                <div className="action-buttons">
                  <button
                    className="btn-secondary"
                    onClick={() => navigate("/admin/reports")}
                  >
                    ← 목록으로
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminAppealDetail;