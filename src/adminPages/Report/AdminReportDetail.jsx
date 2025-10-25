import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./AdminReportDetail.css";

function AdminReportDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [report, setReport] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [memo, setMemo] = useState("");
  
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

  const isProcessed = report?.status === "RESOLVED" || 
                      report?.status === "ACTION_TAKEN" || 
                      report?.status === "REJECTED";

  // 제재 섹션 표시 여부
  const showPenaltySection = (newStatus === "RESOLVED" || newStatus === "ACTION_TAKEN") && !isProcessed;

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

  const handleProcess = () => {
    if (!confirm("신고를 처리하시겠습니까?")) return;

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

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
        const errorMessage = err.response?.data?.message || err.message;
        alert("신고 처리 중 오류 발생:\n" + errorMessage);
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

            {isProcessed && (
              <div className="alert-box warning">
                ⚠️ 이 신고는 이미 처리가 완료되어 수정할 수 없습니다.
              </div>
            )}

            {/* ─── 신고 정보 ─────────────────────────── */}
            <div className="report-detail-box">
              <h3>📋 신고 정보</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">ID:</span>
                  <span className="info-value">{report.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">유형:</span>
                  <span className="info-value">
                    {report.reportType === "POST" ? "게시글" : 
                     report.reportType === "COMMENT" ? "댓글" : "공지사항 댓글"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">대상 ID:</span>
                  <span className="info-value">{report.targetId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">현재 상태:</span>
                  <span className={`status-badge status-${report.status.toLowerCase()}`}>
                    {statusLabels[report.status] || report.status}
                  </span>
                </div>
              </div>

              {report.reportType === "POST" && (
                <div className="content-section">
                  <div className="info-label">게시글 제목:</div>
                  <div className="content-text">{report.targetTitle}</div>
                  <div className="info-label">게시글 내용:</div>
                  <pre className="content-box">{report.targetContent}</pre>
                </div>
              )}

              {(report.reportType === "COMMENT" || report.reportType === "ANNOUNCEMENT_COMMENT") && (
                <div className="content-section">
                  <div className="info-label">댓글 내용:</div>
                  <pre className="content-box">{report.targetContent}</pre>
                </div>
              )}

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">신고자:</span>
                  <span className="info-value">{report.reporterNickname} (ID: {report.reporterId})</span>
                </div>
                <div className="info-item">
                  <span className="info-label">피신고자:</span>
                  <span className="info-value">{report.reportedNickname} (ID: {report.reportedId})</span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">신고 사유:</span>
                  <span className="info-value">
                    {Array.from(report.reasons).map((r) => reasonLabels[r] || r).join(", ")}
                  </span>
                </div>
                {report.description && (
                  <div className="info-item full-width">
                    <span className="info-label">신고 설명:</span>
                    <span className="info-value">{report.description}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">등록일:</span>
                  <span className="info-value">{new Date(report.createdAt).toLocaleString()}</span>
                </div>
              </div>
              
              {report.handledBy && (
                <div className="handled-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">처리자:</span>
                      <span className="info-value">{report.handledBy}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">처리일:</span>
                      <span className="info-value">{new Date(report.handledAt).toLocaleString()}</span>
                    </div>
                    {report.handlerMemo && (
                      <div className="info-item full-width">
                        <span className="info-label">처리 메모:</span>
                        <span className="info-value">{report.handlerMemo}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ─── 신고 처리 ─────────────────────────── */}
            <div className="report-actions">
              <h3>⚖️ 신고 처리</h3>
              
              {isProcessed ? (
                <div className="processed-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">최종 처리 상태:</span>
                      <span className={`status-badge status-${report.status.toLowerCase()}`}>
                        {statusLabels[report.status]}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">처리자:</span>
                      <span className="info-value">{report.handledBy}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">처리일:</span>
                      <span className="info-value">{new Date(report.handledAt).toLocaleString()}</span>
                    </div>
                    {report.handlerMemo && (
                      <div className="info-item full-width">
                        <span className="info-label">처리 메모:</span>
                        <span className="info-value">{report.handlerMemo}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="form-container">
                  <div className="form-row">
                    <div className="form-group">
                      <label>처리 상태 <span className="required">*</span></label>
                      <select
                        value={newStatus}
                        onChange={(e) => {
                          setNewStatus(e.target.value);
                          // 상태 변경 시 제재 정보 초기화
                          if (e.target.value !== "RESOLVED" && e.target.value !== "ACTION_TAKEN") {
                            setPenaltyType("");
                            setPenaltyReason("");
                            setPenaltyDescription("");
                            setSuspensionDays(3);
                            setEvidence("");
                          }
                        }}
                      >
                        <option value="PENDING">접수</option>
                        <option value="IN_REVIEW">확인 중</option>
                        <option value="REJECTED">기각</option>
                        <option value="RESOLVED">종결</option>
                        <option value="ACTION_TAKEN">조치 완료</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>처리 메모</label>
                    <textarea
                      placeholder="관리자 메모 (신고자에게 표시됨)"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      rows="3"
                    />
                  </div>

                  {/* ─── 제재 부과 섹션 ─────────────────────────── */}
                  {showPenaltySection && (
                    <div className="penalty-section">
                      <div className="penalty-header">
                        <h4>🚨 제재 부과</h4>
                        <span className="penalty-subtitle">신고가 타당한 경우 제재를 부과할 수 있습니다</span>
                      </div>
                      
                      <div className="form-group">
                        <label>제재 유형 <span className="optional">(선택)</span></label>
                        <select
                          value={penaltyType}
                          onChange={(e) => {
                            setPenaltyType(e.target.value);
                            // 제재 유형 변경 시 관련 필드 초기화
                            if (e.target.value === "") {
                              setPenaltyReason("");
                              setPenaltyDescription("");
                              setEvidence("");
                            }
                          }}
                        >
                          <option value="">제재 없음</option>
                          <option value="WARNING">경고</option>
                          <option value="SUSPENSION">정지</option>
                          <option value="PERMANENT">영구정지</option>
                        </select>
                      </div>

                      {penaltyType && (
                        <div className="penalty-details">
                          <div className="form-group">
                            <label>제재 사유 <span className="required">*</span></label>
                            <input
                              type="text"
                              placeholder="예: 욕설 사용 (최소 5자 이상)"
                              value={penaltyReason}
                              onChange={(e) => setPenaltyReason(e.target.value)}
                              required
                            />
                            {penaltyReason && penaltyReason.length < 5 && (
                              <span className="field-hint error">최소 5자 이상 입력해주세요</span>
                            )}
                          </div>

                          <div className="form-group">
                            <label>제재 상세 설명 <span className="optional">(선택)</span></label>
                            <textarea
                              placeholder="예: 커뮤니티 가이드 위반으로 경고 조치"
                              value={penaltyDescription}
                              onChange={(e) => setPenaltyDescription(e.target.value)}
                              rows="3"
                            />
                          </div>

                          {penaltyType === "SUSPENSION" && (
                            <div className="form-group">
                              <label>정지 기간 (일) <span className="required">*</span></label>
                              <div className="input-with-hint">
                                <input
                                  type="number"
                                  min="1"
                                  max="365"
                                  value={suspensionDays}
                                  onChange={(e) => setSuspensionDays(e.target.value)}
                                  required
                                />
                                <span className="field-hint">1일 ~ 365일 사이로 설정</span>
                              </div>
                            </div>
                          )}

                          <div className="form-group">
                            <label>증거 자료 <span className="optional">(선택)</span></label>
                            <textarea
                              placeholder="예: 게시글 URL, 스크린샷 링크 등"
                              value={evidence}
                              onChange={(e) => setEvidence(e.target.value)}
                              rows="2"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="action-buttons">
                <button 
                  className="admin-btn-primary" 
                  onClick={handleProcess}
                  disabled={isProcessed}
                >
                  {isProcessed ? "✅ 처리 완료됨" : "✅ 신고 처리하기"}
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