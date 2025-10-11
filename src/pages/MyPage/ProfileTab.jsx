import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ProfileTab.css";

function ProfileTab({ data, onUpdate }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 원본 데이터 저장
  const [originalData, setOriginalData] = useState({
    nickname: data?.nickname || "",
    email: data?.email || "",
  });

  // Looper ID 수정 상태
  const [looperId, setLooperId] = useState({
    nickname: data?.nickname || "",
  });
  const [isLooperIdChanged, setIsLooperIdChanged] = useState(false);

  // Personal Information 수정 상태
  const [personalInfo, setPersonalInfo] = useState({
    email: data?.email || "",
  });
  const [isPersonalInfoChanged, setIsPersonalInfoChanged] = useState(false);

  // 비밀번호 변경 상태
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordFormFilled, setIsPasswordFormFilled] = useState(false);

  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  // data가 업데이트되면 상태 동기화
  useEffect(() => {
    if (data) {
      const newOriginal = {
        nickname: data.nickname || "",
        email: data.email || "",
      };
      setOriginalData(newOriginal);
      setLooperId({ nickname: data.nickname || "" });
      setPersonalInfo({ email: data.email || "" });
      setIsLooperIdChanged(false);
      setIsPersonalInfoChanged(false);
    }
  }, [data]);

  // 비밀번호 입력 상태 감지
  useEffect(() => {
    const isFilled =
      passwords.currentPassword.trim() !== "" &&
      passwords.newPassword.trim() !== "" &&
      passwords.confirmPassword.trim() !== "";
    setIsPasswordFormFilled(isFilled);
  }, [passwords]);

  // 아이디 마스킹
  const maskUsername = (username) => {
    if (!username) return "";
    if (username.length <= 2) return "*".repeat(username.length);
    return username.substring(0, 2) + "*".repeat(username.length - 2);
  };

  // Looper ID 변경 감지
  const handleLooperIdChange = (e) => {
    const newValue = e.target.value;
    setLooperId({ nickname: newValue });
    setIsLooperIdChanged(newValue !== originalData.nickname);
  };

  // Personal Info 변경 감지
  const handleEmailChange = (e) => {
    const newValue = e.target.value;
    setPersonalInfo({ email: newValue });
    setIsPersonalInfoChanged(newValue !== originalData.email);
  };

  // 비밀번호 입력 변경
  const handlePasswordInputChange = (field, value) => {
    setPasswords({ ...passwords, [field]: value });
  };

  // Looper ID 취소
  const handleCancelLooperId = () => {
    setLooperId({ nickname: originalData.nickname });
    setIsLooperIdChanged(false);
  };

  // Personal Info 취소
  const handleCancelPersonalInfo = () => {
    setPersonalInfo({ email: originalData.email });
    setIsPersonalInfoChanged(false);
  };

  // 비밀번호 폼 취소
  const handleCancelPassword = () => {
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Looper ID 저장
  const handleSaveLooperId = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/mypage/profile`,
        {
          nickname: looperId.nickname,
          email: originalData.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("닉네임이 변경되었습니다.");
      setIsLooperIdChanged(false);
      onUpdate();
    } catch (err) {
      alert(err.response?.data || "닉네임 변경 실패");
    }
  };

  // Personal Info 저장
  const handleSavePersonalInfo = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/mypage/profile`,
        {
          nickname: originalData.nickname,
          email: personalInfo.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("이메일이 변경되었습니다.");
      setIsPersonalInfoChanged(false);
      onUpdate();
    } catch (err) {
      alert(err.response?.data || "이메일 변경 실패");
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/mypage/password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          newPasswordConfirm: passwords.confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data || "비밀번호가 변경되었습니다.");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const message = err.response?.data || "비밀번호 변경 실패";
      alert(message);
    }
  };

  return (
    <div className="profile-tab">
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
          <div className="inline-edit-row">
            <div className="inline-group">
              <label className="inline-label">NICK NAME</label>
              <input
                type="text"
                className="inline-input"
                value={looperId.nickname}
                onChange={handleLooperIdChange}
              />
            </div>
          </div>


          <div className="button-group">
            {isLooperIdChanged && (
              <button className="cancel-button" onClick={handleCancelLooperId}>
                CANCEL
              </button>
            )}
            <button
              className={`save-button ${isLooperIdChanged ? "active" : ""}`}
              onClick={handleSaveLooperId}
              disabled={!isLooperIdChanged}
            >
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>

      {/* Personal Information 섹션 */}
      <div className="profile-section">
        <div className="section-left">
          <h2 className="section-title">이메일 변경</h2>
          <p className="section-description">
            이 정보는 비공개이며 다른 플레이어와 공유되지 않습니다.
          </p>
        </div>
        <div className="section-right">
          <div className="inline-edit-row full">
            <div className="inline-group full">
              <label className="inline-label">EMAIL ADDRESS</label>
              <input
                type="email"
                className="inline-input"
                value={personalInfo.email}
                onChange={handleEmailChange}
              />
            </div>
          </div>
          <div className="inline-edit-row">
            <div className="inline-group">
              <label className="inline-label">COUNTRY / REGION</label>
              <div className="inline-value">KOR</div>
            </div>
            <div className="inline-group">
              <label className="inline-label">DATE OF BIRTH</label>
              <div className="inline-value">
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

          <div className="button-group">
            {isPersonalInfoChanged && (
              <button
                className="cancel-button"
                onClick={handleCancelPersonalInfo}
              >
                CANCEL
              </button>
            )}
            <button
              className={`save-button ${isPersonalInfoChanged ? "active" : ""}`}
              onClick={handleSavePersonalInfo}
              disabled={!isPersonalInfoChanged}
            >
              SAVE AND VERIFY
            </button>
          </div>
        </div>
      </div>

      {/* Looper Account Sign-In 섹션 */}
      <div className="profile-section">
        <div className="section-left">
          <h2 className="section-title">비밀번호 변경</h2>
          <p className="section-description">
            보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.
          </p>
        </div>
        <div className="section-right">
          <div className="inline-edit-row full">
            <div className="inline-group full">
              <label className="inline-label">USERNAME</label>
              <div className="inline-value">{maskUsername(data?.username)}</div>
            </div>
          </div>

          <form className="password-form" onSubmit={handlePasswordChange}>
            <h3 className="password-title">비밀번호 변경</h3>

            <div className="password-field">
              <label className="inline-label">CURRENT PASSWORD</label>
              <input
                type="password"
                className="inline-input"
                value={passwords.currentPassword}
                onChange={(e) =>
                  handlePasswordInputChange("currentPassword", e.target.value)
                }
              />
            </div>

            <div className="password-field">
              <label className="inline-label">NEW PASSWORD</label>
              <input
                type="password"
                className="inline-input"
                value={passwords.newPassword}
                onChange={(e) =>
                  handlePasswordInputChange("newPassword", e.target.value)
                }
              />
            </div>

            <div className="password-field">
              <label className="inline-label">CONFIRM NEW PASSWORD</label>
              <input
                type="password"
                className="inline-input"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  handlePasswordInputChange("confirmPassword", e.target.value)
                }
              />
            </div>

            <div className="button-group">
              {isPasswordFormFilled && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancelPassword}
                >
                  CANCEL
                </button>
              )}
              <button
                type="submit"
                className={`save-button ${isPasswordFormFilled ? "active" : ""}`}
                disabled={!isPasswordFormFilled}
              >
                SAVE CHANGES
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileTab;