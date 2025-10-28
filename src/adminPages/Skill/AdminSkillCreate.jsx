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
    name: ["", ""],
    description: ["", ""],
  });

  // 이미지 업로드 관련 state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 이미지 선택 시
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("이미지 파일 크기는 10MB를 초과할 수 없습니다.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setImageFile(file);

      // 미리보기
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // 기본 이미지
  const getSkillImage = () => {
    if (imagePreview) return imagePreview;
    return "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMTEyMTZfNDAg%2FMDAxNjM5NjQxNzUxMDc5.8Z45VaLbczbt6T0CnwI5852sOiWcu9zqPby1vdSSVJ0g.wFZHYWgSfK9TsAXqEPG71DPVaz1USCDCw0aImGSBhAcg.PNG.glory8743%2F1231312.png&type=sc960_832";
  };

  // 저장
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
      const formData = new FormData();
      formData.append(
        "skill",
        new Blob([JSON.stringify(editData)], {
          type: "application/json",
        })
      );
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.post(`${API_BASE_URL}/api/skills`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("스킬이 성공적으로 추가되었습니다!");
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
            {/* 헤더 */}
            <h2 className="skill-create-title">스킬 추가</h2>

            {/* 메인 컨테이너 */}
            <div className="skill-create-container">
              {/* 왼쪽 - 이미지 */}
              <div className="skill-create-left">
                <div className="skill-create-image-box">
                  <img
                    src={getSkillImage()}
                    alt="New Skill"
                    onError={(e) => {
                      e.target.src =
                        "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMTEyMTZfNDAg%2FMDAxNjM5NjQxNzUxMDc5.8Z45VaLbczbt6T0CnwI5852sOiWcu9zqPby1vdSSVJ0g.wFZHYWgSfK9TsAXqEPG71DPVaz1USCDCw0aImGSBhAcg.PNG.glory8743%2F1231312.png&type=sc960_832";
                    }}
                  />
                </div>

                <button
                  className="skill-create-upload-button"
                  onClick={() => document.getElementById("skill-image-upload").click()}
                >
                  이미지 업로드
                </button>
                <input
                  id="skill-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              {/* 오른쪽 - 폼 */}
              <div className="skill-create-right">
                {/* ID */}
                <div className="skill-create-row">
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

                {/* 이름 (영문) */}
                <div className="skill-create-row">
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

                {/* 이름 (한글) */}
                <div className="skill-create-row">
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

                {/* 설명 (영문) */}
                <div className="skill-create-row">
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

                {/* 설명 (한글) */}
                <div className="skill-create-row">
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

                {/* 버튼 */}
                <div className="skill-create-divider"></div>
                <div className="skill-create-buttons">
                  <button className="skill-create-save-btn" onClick={handleSave}>
                    저장
                  </button>
                  <button
                    className="skill-create-cancel-btn"
                    onClick={() => navigate("/admin/skills")}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>

            {/* 뒤로 가기 */}
            <button
              className="skill-create-back-btn"
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