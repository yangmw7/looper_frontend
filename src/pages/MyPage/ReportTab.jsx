import React, { useState, useEffect } from "react";
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaClock, 
  FaBan,
  FaShieldAlt,
  FaClipboardList
} from "react-icons/fa";
import { MdGavel, MdReport } from "react-icons/md";
import { IoWarning } from "react-icons/io5";
import "./ReportTab.css";

function ReportTab() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const [activeSubTab, setActiveSubTab] = useState("penalties");
  const [penalties, setPenalties] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // 이의신청 관련 상태
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealPenaltyId, setAppealPenaltyId] = useState(null);
  const [appealReason, setAppealReason] = useState("");
  const [appealData, setAppealData] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  // 데이터 로드
  const loadData = async () => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    setLoading(true);

    try {
      const endpoint = activeSubTab === "penalties" ? "penalties" : "reports";
      const res = await fetch(`${API_BASE_URL}/api/mypage/${endpoint}`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) throw new Error("데이터 로드 실패");
      
      const data = await res.json();
      
      if (activeSubTab === "penalties") {
        setPenalties(data);
      } else {
        setReports(data);
      }
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 이의신청 내역 조회
  const loadAppealData = async (penaltyId) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/mypage/penalties/${penaltyId}/appeal`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAppealData(data);
      } else {
        setAppealData(null);
      }
    } catch (err) {
      console.error("이의신청 내역 조회 실패:", err);
      setAppealData(null);
    }
  };

  // 제재 타입별 스타일
  const getPenaltyStyle = (type) => {
    const styles = {
      WARNING: { color: "#ffa726", icon: <FaExclamationTriangle />, label: "경고" },
      SUSPENSION: { color: "#ef5350", icon: <FaBan />, label: "정지" },
      PERMANENT: { color: "#9c27b0", icon: <MdGavel />, label: "영구정지" }
    };
    return styles[type] || styles.WARNING;
  };

  // 신고 상태별 스타일
  const getReportStatus = (status) => {
    const styles = {
      PENDING: { color: "#42a5f5", icon: <FaClock />, label: "검토중" },
      RESOLVED: { color: "#66bb6a", icon: <FaCheckCircle />, label: "처리완료" },
      ACTION_TAKEN: { color: "#66bb6a", icon: <FaCheckCircle />, label: "제재조치" },
      REJECTED: { color: "#ef5350", icon: <FaBan />, label: "기각" }
    };
    return styles[status] || styles.PENDING;
  };

  // 이의신청 상태별 스타일
  const getAppealStatus = (status) => {
    const styles = {
      PENDING: { color: "#42a5f5", label: "검토중" },
      APPROVED: { color: "#66bb6a", label: "승인됨" },
      REJECTED: { color: "#ef5350", label: "기각됨" }
    };
    return styles[status] || styles.PENDING;
  };

  // 상세보기 모달 열기
  const openDetailModal = async (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
    
    // 제재 상세보기일 경우 이의신청 내역도 조회
    if (activeSubTab === "penalties" && item.appealSubmitted) {
      await loadAppealData(item.id);
    }
  };

  // 이의신청 모달 열기
  const openAppealModal = (penaltyId) => {
    setAppealPenaltyId(penaltyId);
    setAppealReason("");
    setShowAppealModal(true);
  };

  // 이의신청 제출
  const handleAppealSubmit = async () => {
    if (!appealReason.trim()) {
      alert("이의신청 사유를 입력해주세요.");
      return;
    }

    if (!confirm("이의신청을 제출하시겠습니까?")) return;
    
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/mypage/penalties/${appealPenaltyId}/appeal`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ appealReason: appealReason.trim() })
      });
      
      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }
      
      alert("이의신청이 접수되었습니다. 검토까지 2-3일 소요될 수 있습니다.");
      setShowAppealModal(false);
      loadData();
    } catch (err) {
      alert("이의신청 실패: " + err.message);
    }
  };

  // 제재 내역 렌더링
  const renderPenalties = () => {
    const activePenalties = penalties.filter(p => p.isActive);

    return (
      <div className="report-section">
        {activePenalties.length > 0 && (
          <div className="alert-box active-penalty">
            <FaShieldAlt className="alert-icon" />
            <div className="alert-content">
              <h3>
                <IoWarning style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                현재 활성 제재: {activePenalties.length}건
              </h3>
              <p>제재 기간 중에는 일부 서비스 이용이 제한됩니다.</p>
            </div>
          </div>
        )}

        {penalties.length === 0 ? (
          <div className="empty-state">
            <FaCheckCircle className="empty-icon" />
            <h3>제재 내역이 없습니다</h3>
            <p>깨끗한 계정을 유지해주셔서 감사합니다!</p>
          </div>
        ) : (
          <div className="penalty-list">
            {penalties.map((penalty) => {
              const style = getPenaltyStyle(penalty.type);
              return (
                <div 
                  key={penalty.id} 
                  className={`penalty-card ${penalty.isActive ? 'active' : 'past'}`}
                  onClick={() => openDetailModal(penalty)}
                >
                  <div className="penalty-header">
                    <div className="penalty-type" style={{ color: style.color }}>
                      {style.icon}
                      <span>{style.label}</span>
                    </div>
                    <div className="penalty-badges">
                      {penalty.isActive && <span className="status-badge active">진행중</span>}
                      {!penalty.isActive && <span className="status-badge past">종료</span>}
                      {penalty.appealSubmitted && (
                        <span className="status-badge appeal">이의신청됨</span>
                      )}
                    </div>
                  </div>

                  <div className="penalty-body">
                    <h4 className="penalty-reason">{penalty.reason}</h4>
                    <p className="penalty-detail">{penalty.description}</p>
                    
                    <div className="penalty-info">
                      <div className="info-row">
                        <span className="label">제재 기간:</span>
                        <span className="value">
                          {new Date(penalty.startDate).toLocaleDateString()} ~ 
                          {penalty.endDate ? new Date(penalty.endDate).toLocaleDateString() : "영구"}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="label">제재 일자:</span>
                        <span className="value">{new Date(penalty.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="penalty-footer">
                    {penalty.canAppeal && !penalty.appealSubmitted && (
                      <button 
                        className="appeal-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAppealModal(penalty.id);
                        }}
                      >
                        이의신청
                      </button>
                    )}
                    {penalty.appealSubmitted && (
                      <button className="appeal-submitted-btn" disabled>
                        이의신청 제출됨
                      </button>
                    )}
                    <button className="detail-btn">상세보기</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 신고 내역 렌더링
  const renderReports = () => {
    return (
      <div className="report-section">
        <div className="summary-cards">
          <div className="summary-card">
            <FaClipboardList className="summary-icon" />
            <div className="summary-text">
              <h4>총 신고 건수</h4>
              <p className="summary-value">{reports.length}건</p>
            </div>
          </div>
          <div className="summary-card">
            <FaClock className="summary-icon pending" />
            <div className="summary-text">
              <h4>검토중</h4>
              <p className="summary-value">
                {reports.filter(r => r.status === 'PENDING').length}건
              </p>
            </div>
          </div>
          <div className="summary-card">
            <FaCheckCircle className="summary-icon completed" />
            <div className="summary-text">
              <h4>처리완료</h4>
              <p className="summary-value">
                {reports.filter(r => r.status === 'RESOLVED' || r.status === 'ACTION_TAKEN').length}건
              </p>
            </div>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="empty-state">
            <MdReport className="empty-icon" />
            <h3>신고 내역이 없습니다</h3>
            <p>문제가 발생하면 언제든지 신고해주세요.</p>
          </div>
        ) : (
          <div className="report-list">
            {reports.map((report) => {
              const statusStyle = getReportStatus(report.status);
              return (
                <div 
                  key={report.id} 
                  className="report-card"
                  onClick={() => openDetailModal(report)}
                >
                  <div className="report-header">
                    <h4 className="report-title">
                      {report.reportType === 'POST' ? '게시글 신고' : '댓글 신고'}
                    </h4>
                    <div className="report-status" style={{ color: statusStyle.color }}>
                      {statusStyle.icon}
                      <span>{statusStyle.label}</span>
                    </div>
                  </div>

                  <div className="report-body">
                    <p className="report-reason">
                      {report.reasons?.join(', ') || '사유 없음'}
                    </p>
                    <div className="report-target">
                      <span className="label">신고 대상:</span>
                      <span className="value">{report.reportedNickname}</span>
                    </div>
                    <div className="report-date">
                      <span className="label">신고 일자:</span>
                      <span className="value">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 이의신청 모달
  const renderAppealModal = () => {
    if (!showAppealModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowAppealModal(false)}>
        <div className="modal-content appeal-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>이의신청</h3>
            <button className="close-btn" onClick={() => setShowAppealModal(false)}>×</button>
          </div>
          
          <div className="modal-body">
            <p className="appeal-guide">
              제재가 부당하다고 생각되시면 이의신청을 제출할 수 있습니다.<br/>
              관리자가 검토 후 2-3일 내에 결과를 알려드립니다.
            </p>
            
            <div className="form-group">
              <label htmlFor="appealReason">이의신청 사유 <span className="required">*</span></label>
              <textarea
                id="appealReason"
                className="appeal-textarea"
                placeholder="어떤 점이 억울하신지 구체적으로 작성해주세요. (최소 10자 이상)"
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                rows={6}
                maxLength={1000}
              />
              <div className="char-count">
                {appealReason.length} / 1000자
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowAppealModal(false)}
              >
                취소
              </button>
              <button 
                className="submit-btn" 
                onClick={handleAppealSubmit}
                disabled={appealReason.trim().length < 10}
              >
                이의신청 제출
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 상세보기 모달
  const renderDetailModal = () => {
    if (!showDetailModal || !selectedItem) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{activeSubTab === "penalties" ? "제재 상세 정보" : "신고 상세 정보"}</h3>
            <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          
          <div className="modal-body">
            {activeSubTab === "penalties" ? (
              <div className="detail-content">
                <div className="detail-row">
                  <span className="detail-label">제재 유형:</span>
                  <span className="detail-value">{getPenaltyStyle(selectedItem.type).label}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">제재 사유:</span>
                  <span className="detail-value">{selectedItem.reason}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">상세 내용:</span>
                  <span className="detail-value">{selectedItem.description}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">제재 기간:</span>
                  <span className="detail-value">
                    {new Date(selectedItem.startDate).toLocaleDateString()} ~ 
                    {selectedItem.endDate ? new Date(selectedItem.endDate).toLocaleDateString() : "영구"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">증거 자료:</span>
                  <span className="detail-value">{selectedItem.evidence || "없음"}</span>
                </div>

                {/* 이의신청 내역 */}
                {selectedItem.appealSubmitted && appealData && (
                  <>
                    <div className="appeal-divider"></div>
                    <div className="appeal-section">
                      <h4 className="appeal-section-title">이의신청 내역</h4>
                      
                      <div className="detail-row">
                        <span className="detail-label">신청 일자:</span>
                        <span className="detail-value">
                          {new Date(appealData.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">이의신청 사유:</span>
                        <span className="detail-value">{appealData.appealReason}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">처리 상태:</span>
                        <span 
                          className="detail-value appeal-status" 
                          style={{ color: getAppealStatus(appealData.status).color }}
                        >
                          {getAppealStatus(appealData.status).label}
                        </span>
                      </div>

                      {appealData.status !== 'PENDING' && (
                        <>
                          <div className="detail-row">
                            <span className="detail-label">관리자 답변:</span>
                            <span className="detail-value">{appealData.adminResponse || "없음"}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">처리 일자:</span>
                            <span className="detail-value">
                              {new Date(appealData.processedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="detail-content">
                <div className="detail-row">
                  <span className="detail-label">신고 유형:</span>
                  <span className="detail-value">
                    {selectedItem.reportType === 'POST' ? '게시글 신고' : '댓글 신고'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">신고 사유:</span>
                  <span className="detail-value">
                    {selectedItem.reasons?.join(', ') || '없음'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">상세 설명:</span>
                  <span className="detail-value">{selectedItem.description || "없음"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">신고 대상:</span>
                  <span className="detail-value">{selectedItem.reportedNickname}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">처리 상태:</span>
                  <span className="detail-value">{getReportStatus(selectedItem.status).label}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="report-tab">
      <div className="tab-header">
        <h2 className="tab-title">
          <IoWarning style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          신고 & 제재 관리
        </h2>
        <p className="tab-subtitle">내가 받은 제재와 신고한 내역을 확인하세요</p>
      </div>

      <div className="sub-tabs">
        <button
          className={`sub-tab-btn ${activeSubTab === "penalties" ? "active" : ""}`}
          onClick={() => setActiveSubTab("penalties")}
        >
          <MdGavel className="sub-tab-icon" />
          내가 받은 제재
        </button>
        <button
          className={`sub-tab-btn ${activeSubTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveSubTab("reports")}
        >
          <MdReport className="sub-tab-icon" />
          내가 신고한 내역
        </button>
      </div>

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <>
          {activeSubTab === "penalties" ? renderPenalties() : renderReports()}
        </>
      )}

      {renderAppealModal()}
      {renderDetailModal()}
    </div>
  );
}

export default ReportTab;