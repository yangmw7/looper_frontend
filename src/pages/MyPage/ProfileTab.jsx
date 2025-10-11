import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ProfileTab.css";

function ProfileTab({ data, onUpdate }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [originalData, setOriginalData] = useState({
    nickname: data?.nickname || "",
    email: data?.email || "",
  });

  const [looperId, setLooperId] = useState({
    nickname: data?.nickname || "",
  });
  const [isLooperIdChanged, setIsLooperIdChanged] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    email: data?.email || "",
  });
  const [isPersonalInfoChanged, setIsPersonalInfoChanged] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isPasswordFormFilled, setIsPasswordFormFilled] = useState(false);

  // 눈 아이콘 상태 (보이기 여부)
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // 각 input focus 상태
  const [focusedField, setFocusedField] = useState(null);

  // 비밀번호 제약 조건 검사
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    variety: false,
  });

  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  // 초기 데이터 동기화
  useEffect(() => {
    if (data) {
      setOriginalData({
        nickname: data.nickname || "",
        email: data.email || "",
      });
      setLooperId({ nickname: data.nickname || "" });
      setPersonalInfo({ email: data.email || "" });
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

  // 비밀번호 조건 체크
  useEffect(() => {
    const pwd = passwords.newPassword;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[@$!%*?&]/.test(pwd);

    setPasswordChecks({
      length: pwd.length >= 8,
      variety: [hasLetter, hasNumber, hasSymbol].filter(Boolean).length >= 2,
    });
  }, [passwords.newPassword]);

  // 유저 이름 마스킹
  const maskUsername = (username) => {
    if (!username) return "";
    if (username.length <= 2) return "*".repeat(username.length);
    return username.substring(0, 2) + "*".repeat(username.length - 2);
  };

  // 필드 변경 핸들러
  const handleLooperIdChange = (e) => {
    setLooperId({ nickname: e.target.value });
    setIsLooperIdChanged(e.target.value !== originalData.nickname);
  };

  const handleEmailChange = (e) => {
    setPersonalInfo({ email: e.target.value });
    setIsPersonalInfoChanged(e.target.value !== originalData.email);
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswords({ ...passwords, [field]: value });
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // 취소 핸들러
  const handleCancelLooperId = () => {
    setLooperId({ nickname: originalData.nickname });
    setIsLooperIdChanged(false);
  };

  const handleCancelPersonalInfo = () => {
    setPersonalInfo({ email: originalData.email });
    setIsPersonalInfoChanged(false);
  };

  const handleCancelPassword = () => {
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // 저장 핸들러
  const handleSaveLooperId = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/mypage/profile`,
        { nickname: looperId.nickname, email: originalData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("닉네임이 변경되었습니다.");
      setIsLooperIdChanged(false);
      onUpdate();
    } catch {
      alert("닉네임 변경 실패");
    }
  };

  const handleSavePersonalInfo = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/mypage/profile`,
        { nickname: originalData.nickname, email: personalInfo.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("이메일이 변경되었습니다.");
      setIsPersonalInfoChanged(false);
      onUpdate();
    } catch {
      alert("이메일 변경 실패");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/mypage/password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          newPasswordConfirm: passwords.confirmPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("비밀번호가 변경되었습니다.");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      alert("비밀번호 변경 실패");
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

      {/* 이메일 변경 섹션 */}
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

      {/* 비밀번호 변경 섹션 */}
      <div className="profile-section">
        <div className="section-left">
          <h2 className="section-title">비밀번호 변경</h2>
          <p className="section-description">
            보안을 위해 정기적으로 비밀번호를 
            <br></br>
            변경하는 것을 권장합니다.
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

            {["current", "new", "confirm"].map((type) => (
              <div className="password-field" key={type}>
                <label className="inline-label">
                  {type === "current"
                    ? "현재 비밀번호"
                    : type === "new"
                    ? "새 비밀번호"
                    : "새 비밀번호 확인"}
                </label>

                <div className="password-input-wrapper">
                  <input
                    type={showPassword[type] ? "text" : "password"}
                    className="inline-input"
                    value={passwords[`${type}Password`]}
                    onFocus={() => setFocusedField(type)}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) =>
                      handlePasswordInputChange(`${type}Password`, e.target.value)
                    }
                  />

                  {/* 눈 아이콘 (focus 시만 표시) */}
                  {focusedField === type && (
                    <span
                      className="password-toggle"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleShowPassword(type)}
                    >
                      {showPassword[type] ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  )}
                </div>

                {/* 새 비밀번호 제약 조건 (focus 시 표시) */}
                {type === "new" && focusedField === "new" && (
                  <ul className="password-rules">
                    <li className={passwordChecks.length ? "valid" : ""}>
                      비밀번호는 8-20자여야 합니다.
                    </li>
                    <li className={passwordChecks.variety ? "valid" : ""}>
                      비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.
                    </li>
                  </ul>
                )}
              </div>
            ))}

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
