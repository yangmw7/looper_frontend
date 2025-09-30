// src/adminPages/Skill/AdminSkillCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./AdminSkillCreate.css";

function AdminSkillCreate() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [editData, setEditData] = useState({
    id: "",
    name: ["", ""],         // [영문, 한글]
    description: ["", ""],  // [영문, 한글]
  });

  const getSkillImage = () => {
    return "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMTEyMTZfNDAg%2FMDAxNjM5NjQxNzUxMDc5.8Z45VaLbczbt6T0CnwI5852sOiWcu9zqPby1vdSSVJ0g.wFZHYWgSfK9TsAXqEPG71DPVaz1USCDCw0aImGSBhAcg.PNG.glory8743%2F1231312.png&type=sc960_832";
  };

  const handleSave = async () => {
    if (!editData.id.trim()) {
      alert("스킬 ID를 입력해주세요.");
      return;
    }

    if (!editData.name[0].trim() || !editData.name[1].trim()) {
      alert("스킬 이름(영문, 한글)을 모두 입력해야 합니다.");
      return;
    }

    if (!editData.description[0].trim() || !editData.description[1].trim()) {
      alert("스킬 설명(영문, 한글)을 모두 입력해야 합니다.");
      return;
    }

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    try {
      await axios.post(`${API_BASE_URL}/api/skills`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("스킬이 추가되었습니다.");
      navigate("/admin/skills");
    } catch (err) {
      console.error("스킬 생성 에러:", err);
      if (err.response?.status === 400) {
        const errorMessage =
          err.response?.data?.message || err.response?.data?.error || "";
        if (
          errorMessage.includes("duplicate") ||
          errorMessage.includes("already exists") ||
          errorMessage.includes("중복") ||
          errorMessage.includes("이미 존재")
        ) {
          alert("ID가 중복되었습니다. 다른 ID를 입력해주세요.");
        } else {
          alert("잘못된 요청입니다. 입력 내용을 확인해주세요.");
        }
      } else if (err.response?.status === 409) {
        alert("ID가 중복되었습니다. 다른 ID를 입력해주세요.");
      } else if (err.response?.status === 403) {
        alert("관리자 권한이 필요합니다.");
      } else {
        alert("스킬 추가 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <div className="detail-header">
              <h2 className="admin-title">스킬 추가</h2>
            </div>

            <div className="skill-detail-content">
              <div className="skill-detail-left">
                <div className="skill-detail-image">
                  <img
                    src={getSkillImage()}
                    alt="New Skill"
                    onError={(e) => {
                      e.target.src =
                        "https://cdn-icons-png.flaticon.com/512/616/616408.png";
                    }}
                  />
                </div>
              </div>

              <div className="skill-detail-right">
                <div className="detail-row">
                  <label>ID:</label>
                  <input
                    type="text"
                    value={editData.id}
                    onChange={(e) =>
                      setEditData({ ...editData, id: e.target.value })
                    }
                    placeholder="예: 20001"
                  />
                </div>
                <div className="detail-row">
                  <label>이름 (영문):</label>
                  <input
                    type="text"
                    value={editData.name[0]}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        name: [e.target.value, editData.name[1]],
                      })
                    }
                    placeholder="English name"
                  />
                </div>
                <div className="detail-row">
                  <label>이름 (한글):</label>
                  <input
                    type="text"
                    value={editData.name[1]}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        name: [editData.name[0], e.target.value],
                      })
                    }
                    placeholder="한글 이름"
                  />
                </div>
                <div className="detail-row">
                  <label>설명 (영문):</label>
                  <textarea
                    value={editData.description[0]}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        description: [e.target.value, editData.description[1]],
                      })
                    }
                    placeholder="Skill description in English"
                  />
                </div>
                <div className="detail-row">
                  <label>설명 (한글):</label>
                  <textarea
                    value={editData.description[1]}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        description: [editData.description[0], e.target.value],
                      })
                    }
                    placeholder="스킬 설명 (한글)"
                  />
                </div>

                <div className="detail-section">
                  <div className="button-group">
                    <button className="save-button" onClick={handleSave}>
                      저장
                    </button>
                    <button
                      className="cancel-button"
                      onClick={() => navigate("/admin/skills")}
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="back-button bottom-left"
              onClick={() => navigate("/admin/skills")}
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

export default AdminSkillCreate;
