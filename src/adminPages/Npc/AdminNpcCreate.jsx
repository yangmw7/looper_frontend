import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./AdminNpcCreate.css";

function AdminNpcCreate() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  const [editData, setEditData] = useState({
    id: "",
    name: ["", ""],
    hp: 0,
    atk: 0,
    def: 0,
    spd: 0,
    features: [],
  });

  // 이미지 업로드 관련 state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 이미지 선택 시
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("이미지 파일 크기는 10MB를 초과할 수 없습니다.");
        return;
      }

      // 이미지 파일 타입 체크
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }

      setImageFile(file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    // 필드 검증
    if (!editData.id.trim()) {
      alert("NPC ID를 입력해주세요.");
      return;
    }

    if (!editData.name[0].trim() || !editData.name[1].trim()) {
      alert("이름(영문/한글)을 모두 입력해주세요.");
      return;
    }

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    try {
      const formData = new FormData();

      // JSON 데이터 구성
      const npcData = {
        ...editData,
      };

      formData.append(
        "npc",
        new Blob([JSON.stringify(npcData)], {
          type: "application/json",
        })
      );

      // 이미지 파일 추가
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.post(`${API_BASE_URL}/api/npcs`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("NPC가 성공적으로 추가되었습니다!");
      navigate("/admin/npcs");
    } catch (err) {
      console.error("NPC 생성 에러:", err);
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
        alert("NPC 추가 중 오류가 발생했습니다.");
      }
    }
  };

  // 이미지 미리보기
  const getNpcImage = () => {
    if (imagePreview) return imagePreview;
    return "https://i.namu.wiki/i/77y-ptU__gqfagWpDS4YmvNGvE2tAbwFwUN0KZDYI2mbuReEb5AbFhK-3pZbswXTX3l4vii0pdQRgoJG35lHZg.webp";
  };

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            {/* 헤더 */}
            <div className="npc-create-header">
              <h2 className="admin-title">NPC 추가</h2>
            </div>

            {/* 메인 레이아웃 */}
            <div className="npc-create-layout">
              {/* 왼쪽 패널 - 이미지 */}
              <div className="npc-create-left-panel">
                <div className="npc-create-image-wrapper">
                  <img
                    src={getNpcImage()}
                    alt={editData.name[1] || editData.name[0] || "New NPC"}
                    className="npc-create-image"
                  />
                </div>

                {/* 이미지 업로드 섹션 */}
                <div className="npc-create-upload-section">
                  <label htmlFor="npc-image-upload" className="npc-create-upload-btn">
                    {imageFile ? "이미지 변경" : "이미지 업로드"}
                  </label>
                  <input
                    id="npc-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="npc-create-file-input"
                  />
                  {imageFile && (
                    <div className="npc-create-file-info">
                      <p className="npc-create-filename">{imageFile.name}</p>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="npc-create-remove-btn"
                      >
                        이미지 제거
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽 패널 - 폼 */}
              <div className="npc-create-right-panel">
                <div className="npc-create-form">
                  {/* ID */}
                  <div className="npc-create-field">
                    <label className="npc-create-label">ID:</label>
                    <input
                      type="text"
                      className="npc-create-input"
                      value={editData.id}
                      onChange={(e) =>
                        setEditData({ ...editData, id: e.target.value })
                      }
                      placeholder="예: 10001"
                    />
                  </div>

                  {/* 이름 (영문) */}
                  <div className="npc-create-field">
                    <label className="npc-create-label">이름 (영문):</label>
                    <input
                      type="text"
                      className="npc-create-input"
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
                  <div className="npc-create-field">
                    <label className="npc-create-label">이름 (한글):</label>
                    <input
                      type="text"
                      className="npc-create-input"
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

                  {/* 속성 섹션 */}
                  <div className="npc-create-section">
                    <h3 className="npc-create-section-title">속성 (Attributes)</h3>
                    <div className="npc-create-attributes-grid">
                      <div className="npc-create-attribute-item">
                        <label className="npc-create-attr-label">HP:</label>
                        <input
                          type="number"
                          className="npc-create-attr-input"
                          value={editData.hp}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              hp: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="npc-create-attribute-item">
                        <label className="npc-create-attr-label">ATK:</label>
                        <input
                          type="number"
                          className="npc-create-attr-input"
                          value={editData.atk}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              atk: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="npc-create-attribute-item">
                        <label className="npc-create-attr-label">DEF:</label>
                        <input
                          type="number"
                          className="npc-create-attr-input"
                          value={editData.def}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              def: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="npc-create-attribute-item">
                        <label className="npc-create-attr-label">SPD:</label>
                        <input
                          type="number"
                          className="npc-create-attr-input"
                          value={editData.spd}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              spd: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* 특징 섹션 */}
                  <div className="npc-create-section">
                    <h3 className="npc-create-section-title">특징 (Features)</h3>
                    <div className="npc-create-field">
                      <input
                        type="text"
                        className="npc-create-input npc-create-features-input"
                        value={editData.features.join(", ")}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            features: e.target.value
                              .split(",")
                              .map((f) => f.trim())
                              .filter((f) => f),
                          })
                        }
                        placeholder="예: 불속성, 보스, 원거리"
                      />
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="npc-create-actions">
                    <button className="npc-create-btn save" onClick={handleSave}>
                      저장
                    </button>
                    <button
                      className="npc-create-btn cancel"
                      onClick={() => navigate("/admin/npcs")}
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 뒤로 가기 버튼 */}
            <button
              className="npc-create-back-btn"
              onClick={() => navigate("/admin/npcs")}
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

export default AdminNpcCreate;