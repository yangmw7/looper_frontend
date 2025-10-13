import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./AdminReportDetail.css";

function AdminReportDetail() {
  const { type, id } = useParams(); // /admin/reports/post/5
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [report, setReport] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [memo, setMemo] = useState("");
  
  // ✅ 제재 관련 상태 추가
  const [penaltyType, setPenaltyType] = useState("");
  const [penaltyReason, setPenaltyReason] = useState("");
  const [penaltyDescription, setPenaltyDescription] = useState("");
  const [suspensionDays, setSuspensionDays] = useState(3);
  const [evidence, setEvidence] = useState("");
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 상태 한글 매핑
  const statusLabels = {
    PENDING: "접수",
    IN_REVIEW: "확인 중",
    REJECTED: "기각",
    ACTION_TAKEN: "조치 완료",
    RESOLVED: "종결",
  };

  // 사유 한글 매핑
  const reasonLabels = {
    SPAM: "스팸/도배",
    ABUSE: "욕설/비방",
    HATE: "혐오 발언",
    SEXUAL: "음란물",
    ILLEGAL: "불법 정보",
    PERSONAL_INFO: "개인정보 노출",
    OTHER: "기타",
  };

  // 제재 유형 매핑
  const penaltyTypeLabels = {
    "": "제재 없음",
    WARNING: "경고",
    SUSPENSION: "정지",
    PERMANENT: "영구정지",
  };

  // ✅ 신고 상세 데이터 요청
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
      .get(`${API_BASE_URL}/api/admin/reports/${type}s/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setReport(res.data);
        setNewStatus(res.data.status);
        setLoading(false);
      })
      .catch((err) => {
        console.error("신고 상세 요청 실패:", err);
        if (err.response?.status === 403)
          setError("접근 권한이 없습니다. 관리자 계정으로 로그인하세요.");
        else setError("신고 데이터를 불러오는 중 오류 발생");
        setLoading(false);
      });
  }, [API_BASE_URL, id, type]);

  // ✅ 신고 처리 (제재 포함)
  const handleProcess = () => {
    if (!confirm("신고를 처리하시겠습니까?")) return;

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    // ReportActionRequest 구조
    const requestData = {
      status: newStatus,
      handlerMemo: memo,
      penaltyType: penaltyType || null,
      penaltyReason: penaltyReason || null,
      penaltyDescription: penaltyDescription || null,
      suspensionDays: penaltyType === "SUSPENSION" ? parseInt(suspensionDays) : null,
      evidence: evidence || null,
    };

    axios
      .post(
        `${API_BASE_URL}/api/admin/reports/${type}s/${id}/process`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("신고 처리가 완료되었습니다.");
        navigate("/admin/reports");
      })
      .catch((err) => {
        console.error("신고 처리 실패:", err);
        alert("신고 처리 중 오류 발생: " + (err.response?.data?.message || err.message));
      });
  };

  if (loading) return <p className="loading">로딩 중...</p>;
  if (error) return <p className="error-message">에러: {error}</p>;
  if (!report) return <p className="error-message">데이터를 찾을 수 없습니다.</p>;

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <h2 className="admin-title">신고 상세 & 처리</h2>

            {/* ─── 신고 정보 ─────────────────────────── */}
            <div className="report-detail-box">
              <h3>📋 신고 정보</h3>
              <p><b>ID:</b> {report.id}</p>
              <p><b>유형:</b> {report.reportType === "POST" ? "게시글" : "댓글"}</p>
              <p><b>대상 ID:</b> {report.targetId}</p>

              {report.reportType === "POST" && (
                <>
                  <p><b>게시글 제목:</b> {report.targetTitle}</p>
                  <p><b>게시글 내용:</b></p>
                  <pre style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '12px', 
                    borderRadius: '8px',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '200px',
                    overflow: 'auto'
                  }}>
                    {report.targetContent}
                  </pre>
                </>
              )}

              {report.reportType === "COMMENT" && (
                <>
                  <p><b>댓글 내용:</b></p>
                  <pre style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    padding: '12px', 
                    borderRadius: '8px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {report.targetContent}
                  </pre>
                </>
              )}

              <p><b>신고자:</b> {report.reporterNickname} (ID: {report.reporterId})</p>
              <p><b>피신고자:</b> {report.reportedNickname} (ID: {report.reportedId})</p>
              <p>
                <b>신고 사유:</b>{" "}
                {Array.from(report.reasons)
                  .map((r) => reasonLabels[r] || r)
                  .join(", ")}
              </p>
              <p><b>신고 설명:</b> {report.description || "없음"}</p>
              <p><b>현재 상태:</b> {statusLabels[report.status] || report.status}</p>
              <p><b>등록일:</b> {new Date(report.createdAt).toLocaleString()}</p>
              
              {report.handledBy && (
                <>
                  <p><b>처리자:</b> {report.handledBy}</p>
                  <p><b>처리일:</b> {new Date(report.handledAt).toLocaleString()}</p>
                  <p><b>처리 메모:</b> {report.handlerMemo}</p>
                </>
              )}
            </div>

            {/* ─── 신고 처리 ─────────────────────────── */}
            <div className="report-actions">
              <h3>⚖️ 신고 처리</h3>
              
              <div className="form-group">
                <label>처리 상태:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="PENDING">접수</option>
                  <option value="IN_REVIEW">확인 중</option>
                  <option value="REJECTED">기각</option>
                  <option value="RESOLVED">종결 (경고)</option>
                  <option value="ACTION_TAKEN">조치 완료 (정지/영구정지)</option>
                </select>
              </div>

              <div className="form-group">
                <label>처리 메모:</label>
                <textarea
                  placeholder="관리자 메모 (신고자에게 표시됨)"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows="3"
                />
              </div>

              {/* ─── 제재 부과 (선택) ─────────────────────────── */}
              {(newStatus === "RESOLVED" || newStatus === "ACTION_TAKEN") && (
                <div className="penalty-section">
                  <h4>🚨 제재 부과 (선택)</h4>
                  
                  <div className="form-group">
                    <label>제재 유형:</label>
                    <select
                      value={penaltyType}
                      onChange={(e) => setPenaltyType(e.target.value)}
                    >
                      <option value="">제재 없음</option>
                      <option value="WARNING">경고</option>
                      <option value="SUSPENSION">정지</option>
                      <option value="PERMANENT">영구정지</option>
                    </select>
                  </div>

                  {penaltyType && (
                    <>
                      <div className="form-group">
                        <label>제재 사유:</label>
                        <input
                          type="text"
                          placeholder="예: 욕설 사용"
                          value={penaltyReason}
                          onChange={(e) => setPenaltyReason(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>제재 상세 설명:</label>
                        <textarea
                          placeholder="예: 커뮤니티 가이드 위반으로 경고 조치"
                          value={penaltyDescription}
                          onChange={(e) => setPenaltyDescription(e.target.value)}
                          rows="3"
                        />
                      </div>

                      {penaltyType === "SUSPENSION" && (
                        <div className="form-group">
                          <label>정지 기간 (일):</label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={suspensionDays}
                            onChange={(e) => setSuspensionDays(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label>증거 자료:</label>
                        <textarea
                          placeholder="예: 게시글 URL, 스크린샷 링크 등"
                          value={evidence}
                          onChange={(e) => setEvidence(e.target.value)}
                          rows="2"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="action-buttons">
                <button className="admin-btn-primary" onClick={handleProcess}>
                  ✅ 신고 처리하기
                </button>
                <button className="btn-secondary" onClick={() => navigate("/admin/reports")}>
                  ← 목록으로
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminReportDetail;