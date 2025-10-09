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

  // ✅ 관리자 토큰 포함해서 상세 신고 데이터 요청
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

  // 상태 변경
  const handleUpdate = () => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    axios
      .patch(
        `${API_BASE_URL}/api/admin/reports/${type}s/${id}/status`,
        { status: newStatus, handlerMemo: memo },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        alert("상태가 변경되었습니다.");
        navigate("/admin/reports");
      })
      .catch(() => alert("상태 변경 중 오류 발생"));
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
            <h2 className="admin-title">신고 상세</h2>

            <div className="report-detail-box">
              <p><b>ID:</b> {report.id}</p>
              <p><b>유형:</b> {report.type === "POST" ? "게시글" : "댓글"}</p>
              <p><b>대상 ID:</b> {report.targetId}</p>

              {report.type === "POST" && (
                <>
                  <p><b>게시글 제목:</b> {report.targetTitle}</p>
                  <p><b>게시글 내용:</b> {report.targetContent}</p>
                </>
              )}

              {report.type === "COMMENT" && (
                <p><b>댓글 내용:</b> {report.targetContent}</p>
              )}

              <p><b>신고자:</b> {report.reporterNickname}</p>
              <p><b>피신고자:</b> {report.reportedNickname}</p>
              <p>
                <b>신고 사유:</b>{" "}
                {Array.from(report.reasons)
                  .map((r) => reasonLabels[r] || r)
                  .join(", ")}
              </p>
              <p><b>설명:</b> {report.description}</p>
              <p><b>접수 상태:</b> {statusLabels[report.status] || report.status}</p>
              <p><b>등록일:</b> {new Date(report.createdAt).toLocaleString()}</p>
            </div>

            <div className="report-actions">
              <label>상태 변경: </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="PENDING">접수</option>
                <option value="IN_REVIEW">확인 중</option>
                <option value="REJECTED">기각</option>
                <option value="ACTION_TAKEN">조치 완료</option>
                <option value="RESOLVED">종결</option>
              </select>

              <textarea
                placeholder="관리자 메모"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
              <button onClick={handleUpdate}>상태 저장</button>
            </div>

            <button
              className="back-button bottom-left"
              onClick={() => navigate("/admin/reports")}
            >
              ← 목록으로
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminReportDetail;
