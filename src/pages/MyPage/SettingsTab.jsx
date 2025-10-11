import React, { useState } from "react";
import axios from "axios";

function SettingsTab() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    try {
      await axios.put(`${API_BASE_URL}/api/mypage/password`, passwords, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("비밀번호가 변경되었습니다.");
      setPasswords({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });
    } catch (err) {
      alert(err.response?.data || "비밀번호 변경 실패");
    }
  };

  return (
    <div className="settings-tab">
      <h3>비밀번호 변경</h3>
      <form onSubmit={handlePasswordChange}>
        <div>
          <label>현재 비밀번호</label>
          <input
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            required
          />
        </div>
        <div>
          <label>새 비밀번호</label>
          <input
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            required
          />
        </div>
        <div>
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            value={passwords.newPasswordConfirm}
            onChange={(e) => setPasswords({ ...passwords, newPasswordConfirm: e.target.value })}
            required
          />
        </div>
        <button type="submit">변경</button>
      </form>
    </div>
  );
}

export default SettingsTab;