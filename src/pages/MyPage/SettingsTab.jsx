import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaExclamationTriangle } from "react-icons/fa";
import "./SettingsTab.css";

function SettingsTab() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "회원탈퇴") {
      setDeleteError("'회원탈퇴'를 정확히 입력해주세요.");
      return;
    }

    if (!password) {
      setDeleteError("비밀번호를 입력해주세요.");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const token = localStorage.getItem("accessToken") || 
                    sessionStorage.getItem("accessToken");

      await axios.delete(`${API_BASE_URL}/api/auth/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password }
      });

      localStorage.clear();
      sessionStorage.clear();
      
      alert("회원탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (err) {
      console.error("회원탈퇴 실패:", err);
      setIsDeleting(false);
      if (err.response?.status === 401) {
        setDeleteError("비밀번호가 일치하지 않습니다.");
      } else {
        setDeleteError("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText("");
    setPassword("");
    setDeleteError("");
    setIsDeleting(false);
  };

  return (
    <div className="settings-tab">
      <div className="settings-section danger-zone">
        <div className="section-left">
          <h2 className="section-title">
            <FaExclamationTriangle className="warning-icon" />
            회원 탈퇴
          </h2>
          <p className="section-description danger-text">
            계정을 삭제하면 모든 데이터가 영구적으로 <br></br>삭제되며 복구할 수 없습니다.
            <br />
            <br />
            삭제되는 정보:
            <br />
            • 프로필 정보 및 게임 전적
            <br />
            • 작성한 게시글 및 댓글
            <br />
            • 보유 중인 아이템 및 장비
            <br />
            • 친구 목록 및 채팅 기록
          </p>
        </div>
        <div className="section-right">
          <div className="delete-account-box">
            <h3 className="delete-title">정말 탈퇴하시겠습니까?</h3>
            <p className="delete-warning">
              이 작업은 되돌릴 수 없으며, 모든 데이터가 즉시 삭제됩니다.
            </p>
            <button 
              className="delete-button"
              onClick={() => setShowDeleteModal(true)}
            >
              회원 탈퇴하기
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <FaExclamationTriangle className="modal-warning-icon" />
              <h3>회원 탈퇴 확인</h3>
            </div>
            
            <p className="modal-warning-text">
              정말로 탈퇴하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="modal-input-group">
              <label className="inline-label">
                확인을 위해 <strong>'회원탈퇴'</strong>를 입력해주세요
              </label>
              <input
                type="text"
                className="inline-input"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="회원탈퇴"
                disabled={isDeleting}
              />
            </div>

            <div className="modal-input-group">
              <label className="inline-label">비밀번호 확인</label>
              <input
                type="password"
                className="inline-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                disabled={isDeleting}
              />
            </div>

            {deleteError && (
              <div className="error-message">
                <FaExclamationTriangle />
                {deleteError}
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={handleCloseModal}
                disabled={isDeleting}
              >
                취소
              </button>
              <button 
                className="confirm-delete-button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsTab;