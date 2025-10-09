import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./AdminSkillDetail.css";

function AdminSkillDetail() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState({
    id: "",
    name: ["", ""],
    description: ["", ""],
  });

  // 이미지 관련 상태
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 데이터 로드
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    axios
      .get(`${API_BASE_URL}/api/skills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;

        const parsedName = Array.isArray(data.name)
          ? data.name
          : JSON.parse(data.name || "['','']");
        const parsedDescription = Array.isArray(data.description)
          ? data.description
          : JSON.parse(data.description || "['','']");

        const formatted = {
          ...data,
          name: parsedName,
          description: parsedDescription,
        };

        setSkill(formatted);
        setEditData(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("스킬 로드 오류:", err);
        setError(err);
        setLoading(false);
      });
  }, [id]);

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("파일 크기는 10MB를 초과할 수 없습니다.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
      setImageFile(file);
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

  // 현재 보여줄 이미지 결정
  const getSkillImage = () => {
    if (imagePreview) return imagePreview;
    if (skill?.imageUrl) return skill.imageUrl;
    return "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMTEyMTZfNDAg%2FMDAxNjM5NjQxNzUxMDc5.8Z45VaLbczbt6T0CnwI5852sOiWcu9zqPby1vdSSVJ0g.wFZHYWgSfK9TsAXqEPG71DPVaz1USCDCw0aImGSBhAcg.PNG.glory8743%2F1231312.png&type=sc960_832";
  };

  // 저장
  const handleSave = async () => {
    if (!editData.name[0].trim() || !editData.name[1].trim()) {
      alert("이름(영문/한글)을 모두 입력해주세요.");
      return;
    }
    if (!editData.description[0].trim() || !editData.description[1].trim()) {
      alert("설명(영문/한글)을 모두 입력해주세요.");
      return;
    }

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    try {
      const formData = new FormData();
      formData.append(
        "skill",
        new Blob([JSON.stringify(editData)], { type: "application/json" })
      );
      if (imageFile) formData.append("image", imageFile);

      await axios.put(`${API_BASE_URL}/api/skills/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("스킬이 수정되었습니다!");
      window.location.reload();
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 이 스킬을 삭제하시겠습니까?")) return;

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    try {
      await axios.delete(`${API_BASE_URL}/api/skills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("스킬이 삭제되었습니다.");
      navigate("/admin/skills");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error-message">에러 발생: {error.message}</div>;
  if (!skill) return <div className="error-message">스킬을 찾을 수 없습니다.</div>;

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <div className="detail-header">
              <h2 className="admin-title">스킬 상세정보</h2>
            </div>

            <div className="skill-detail-content">
              {/* 왼쪽 - 이미지 */}
              <div className="skill-detail-left">
                <div className="skill-detail-image">
                  <img src={getSkillImage()} alt="Skill" />
                </div>

                {isEditing && (
                  <div className="image-upload-section" style={{ marginTop: "20px" }}>
                    <label htmlFor="image-upload" className="image-upload-label">
                      {imageFile ? "이미지 변경" : "새 이미지 업로드"}
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                    {imageFile && (
                      <div style={{ marginTop: "10px" }}>
                        <p style={{ fontSize: "14px", color: "#ccc" }}>
                          {imageFile.name}
                        </p>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          이미지 제거
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 오른쪽 - 상세정보 */}
              <div className="skill-detail-right">
                {!isEditing ? (
                  <>
                    <div className="detail-row">
                      <label>ID:</label>
                      <span>{skill.id}</span>
                    </div>
                    <div className="detail-row">
                      <label>이름 (영문):</label>
                      <span>{skill.name[0]}</span>
                    </div>
                    <div className="detail-row">
                      <label>이름 (한글):</label>
                      <span>{skill.name[1]}</span>
                    </div>
                    <div className="detail-row">
                      <label>설명 (영문):</label>
                      <span>{skill.description[0]}</span>
                    </div>
                    <div className="detail-row">
                      <label>설명 (한글):</label>
                      <span>{skill.description[1]}</span>
                    </div>

                    <div className="button-group">
                      <button
                        className="edit-button"
                        onClick={() => setIsEditing(true)}
                      >
                        수정
                      </button>
                      <button className="delete-button" onClick={handleDelete}>
                        삭제
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="detail-row">
                      <label>ID:</label>
                      <input type="text" value={editData.id} disabled />
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
                      />
                    </div>

                    <div className="detail-row">
                      <label>설명 (영문):</label>
                      <textarea
                        value={editData.description[0]}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: [
                              e.target.value,
                              editData.description[1],
                            ],
                          })
                        }
                      />
                    </div>

                    <div className="detail-row">
                      <label>설명 (한글):</label>
                      <textarea
                        value={editData.description[1]}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: [
                              editData.description[0],
                              e.target.value,
                            ],
                          })
                        }
                      />
                    </div>

                    <div className="button-group">
                      <button className="save-button" onClick={handleSave}>
                        저장
                      </button>
                      <button
                        className="cancel-button"
                        onClick={() => {
                          setIsEditing(false);
                          setEditData(skill);
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </>
                )}
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

export default AdminSkillDetail;
