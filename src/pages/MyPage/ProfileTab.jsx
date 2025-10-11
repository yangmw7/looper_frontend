import React, { useState } from "react";
import axios from "axios";
import "./ProfileTab.css";

function ProfileTab({ data, onUpdate }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: data?.nickname || "",
    email: data?.email || "",
  });

  // 아이디 모자이크 함수
  const maskUsername = (username) => {
    if (!username) return "";
    if (username.length <= 2) {
      return "*".repeat(username.length);
    }
    const firstTwo = username.substring(0, 2);
    const masked = "*".repeat(username.length - 2);
    return firstTwo + masked;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    try {
      await axios.put(`${API_BASE_URL}/api/mypage/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("프로필이 수정되었습니다.");
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      alert(err.response?.data || "수정 실패");
    }
  };

  return (
    <div className="profile-tab">
      {!isEditing ? (
        <>
          {/* Looper ID 섹션 */}
          <div className="profile-section">
            <div className="section-left">
              <h2 className="section-title">Looper ID</h2>
              <p className="section-description">
                Looper ID는 게임 내에서 다른 플레이어가 당신을 찾을 수 있도록
                사용됩니다.
              </p>
            </div>
            <div className="section-right">
              <div className="info-row single">
                <div className="info-group full-width">
                  <label className="info-label">NICK NAME</label>
                  <div className="info-value">{data?.nickname}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information 섹션 */}
          <div className="profile-section">
            <div className="section-left">
              <h2 className="section-title">개인 정보</h2>
              <p className="section-description">
                이 정보는 비공개이며 다른 플레이어와 공유되지 않습니다.
              </p>
            </div>
            <div className="section-right">
              <div className="info-row">
                <div className="info-group full-width">
                  <label className="info-label">EMAIL ADDRESS</label>
                  <div className="info-value">{data?.email}</div>
                </div>
              </div>
              <div className="info-row">
                <div className="info-group">
                  <label className="info-label">COUNTRY / REGION</label>
                  <div className="info-value">KOR</div>
                </div>
                <div className="info-group">
                  <label className="info-label">DATE OF BIRTH</label>
                  <div className="info-value">
                    {data?.createdDate
                      ? new Date(data.createdDate).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : "•• | •• | ••••"}
                  </div>
                </div>
              </div>
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                수정하기
              </button>
            </div>
          </div>

          {/* Looper Account Sign-In 섹션 */}
          <div className="profile-section">
            <div className="section-left">
              <h2 className="section-title">Looper Account Sign-In</h2>
              <p className="section-description">
                보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.
              </p>
            </div>
            <div className="section-right">
              <div className="info-row">
                <div className="info-group full-width">
                  <label className="info-label">USERNAME</label>
                  <div className="info-value">{maskUsername(data?.username)}</div>
                </div>
              </div>
              <button
                className="edit-button"
                onClick={() => alert("비밀번호 변경 기능은 '설정' 탭에서 이용 가능합니다.")}
              >
                비밀번호 변경
              </button>
            </div>
          </div>
        </>
      ) : (
        /* 수정 모드 */
        <div className="profile-section">
          <div className="section-left">
            <h2 className="section-title">프로필 수정</h2>
            <p className="section-description">
              닉네임과 이메일 정보를 수정할 수 있습니다.
            </p>
          </div>
          <div className="section-right">
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="form-group">
                <label className="form-label">GAME NAME</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                  }
                  placeholder="닉네임을 입력하세요"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">EMAIL ADDRESS</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="save-button active">
                  저장
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsEditing(false)}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileTab;