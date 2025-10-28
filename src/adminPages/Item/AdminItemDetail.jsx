import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./AdminItemDetail.css";

function AdminItemDetail() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    rarity: "common",
    name: ["", ""],
    description: ["", ""],
    attributes: [{ stat: "HP", op: "ADD", value: "" }],
    twoHander: false,
    stackable: false,
    skills: [],
  });

  // ✅ skills 입력용 문자열 상태
  const [skillInput, setSkillInput] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    axios
      .get(`${API_BASE_URL}/api/items/${id}/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;

        const parsedName = Array.isArray(data.name)
          ? data.name
          : JSON.parse(data.name || "[]");
        const parsedDescription = Array.isArray(data.description)
          ? data.description
          : JSON.parse(data.description || "[]");

        let attrData = data.attributes;
        if (typeof attrData === "string") {
          try {
            attrData = JSON.parse(attrData);
          } catch (e) {
            attrData = {};
          }
        }

        let parsedAttributes;
        if (Array.isArray(attrData)) {
          parsedAttributes = attrData.map((attr) => ({
            ...attr,
            stat: attr.stat.toUpperCase(),
          }));
        } else if (typeof attrData === "object" && attrData !== null) {
          parsedAttributes = Object.entries(attrData)
            .filter(
              ([key, value]) =>
                !["twoHander", "stackable"].includes(key) &&
                typeof value === "number" &&
                value !== 0
            )
            .map(([key, value]) => ({
              stat: key.toUpperCase(),
              op: "ADD",
              value: value,
            }));
        } else {
          parsedAttributes = [];
        }

        const parsedSkills = Array.isArray(data.skills)
          ? data.skills
          : JSON.parse(data.skills || "[]");

        const formattedData = {
          ...data,
          name: parsedName,
          description: parsedDescription,
          attributes:
            parsedAttributes.length > 0
              ? parsedAttributes
              : [{ stat: "HP", op: "ADD", value: "" }],
          twoHander: data.twoHander || false,
          stackable: data.stackable || false,
          skills: parsedSkills,
        };

        setItem(formattedData);
        setEditData(formattedData);
        setSkillInput(parsedSkills.join(", ")); // ✅ 문자열로 변환해 입력창에 표시
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [id]);

  const handleAttributeChange = (index, field, value) => {
    const updated = [...editData.attributes];
    if (field === "value") {
      const numericValue = value.replace(/[^0-9.\-]/g, "");
      updated[index][field] = numericValue;
    } else {
      updated[index][field] = value;
    }
    setEditData({ ...editData, attributes: updated });
  };

  const handleAddAttribute = () => {
    setEditData({
      ...editData,
      attributes: [...editData.attributes, { stat: "HP", op: "ADD", value: "" }],
    });
  };

  const handleRemoveAttribute = (index) => {
    if (editData.attributes.length <= 1) return;
    const updated = [...editData.attributes];
    updated.splice(index, 1);
    setEditData({ ...editData, attributes: updated });
  };

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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!editData.name[0].trim() || !editData.name[1].trim()) {
      alert("이름을 모두 입력해주세요.");
      return;
    }
    if (!editData.description[0].trim() || !editData.description[1].trim()) {
      alert("설명을 모두 입력해주세요.");
      return;
    }
    for (let i = 0; i < editData.attributes.length; i++) {
      const attr = editData.attributes[i];
      if (!attr.value || attr.value.toString().trim() === "") {
        alert("모든 속성 값을 입력해야 합니다.");
        return;
      }
    }

    // ✅ skills 입력 문자열을 배열로 변환
    const skillsArray = skillInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    try {
      const formData = new FormData();

      const itemData = {
        ...editData,
        skills: skillsArray,
        attributes: editData.attributes.map((attr) => ({
          ...attr,
          value: parseFloat(attr.value) || 0,
        })),
      };

      formData.append(
        "item",
        new Blob([JSON.stringify(itemData)], { type: "application/json" })
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await axios.put(`${API_BASE_URL}/api/items/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("아이템이 수정되었습니다.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 이 아이템을 삭제하시겠습니까?")) return;
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    try {
      await axios.delete(`${API_BASE_URL}/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("아이템이 삭제되었습니다.");
      navigate("/admin/items");
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const getItemImage = () => {
    if (imagePreview) return imagePreview;
    if (item?.imageUrl) return item.imageUrl;
    return "https://i.namu.wiki/i/77y-ptU__gqfagWpDS4YmvNGvE2tAbwFwUN0KZDYI2mbuReEb5AbFhK-3pZbswXTX3l4vii0pdQRgoJG35lHZg.webp";
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error-message">에러 발생: {error.message}</div>;
  if (!item) return <div className="error-message">아이템을 찾을 수 없습니다.</div>;

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <div className="item-detail-header">
              <h2 className="admin-title">아이템 상세정보</h2>
            </div>

            <div className="item-detail-layout">
              {/* 왼쪽 패널 */}
              <div className="item-detail-left-panel">
                <div className="item-detail-image-wrapper">
                  <img
                    src={getItemImage()}
                    alt={editData.name[1] || editData.name[0]}
                    className="item-detail-image"
                  />
                </div>
                <div className={`item-detail-rarity-badge rarity-${item.rarity}`}>
                  {item.rarity.toUpperCase()}
                </div>

                {isEditing && (
                  <div className="item-detail-upload-section">
                    <label
                      htmlFor="item-detail-image-upload"
                      className="item-detail-upload-btn"
                    >
                      {imageFile ? "이미지 변경" : "새 이미지 업로드"}
                    </label>
                    <input
                      id="item-detail-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="item-detail-file-input"
                    />
                    {imageFile && (
                      <div className="item-detail-file-info">
                        <p className="item-detail-filename">{imageFile.name}</p>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="item-detail-remove-btn"
                        >
                          이미지 제거
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 오른쪽 패널 */}
              <div className="item-detail-right-panel">
                {!isEditing ? (
                  // 보기 모드
                  <div className="item-detail-view-mode">
                    <div className="item-detail-field">
                      <label className="item-detail-label">ID:</label>
                      <span className="item-detail-value">{item.id}</span>
                    </div>
                    <div className="item-detail-field">
                      <label className="item-detail-label">이름 (한글):</label>
                      <span className="item-detail-value">{item.name[1]}</span>
                    </div>
                    <div className="item-detail-field">
                      <label className="item-detail-label">이름 (영문):</label>
                      <span className="item-detail-value">{item.name[0]}</span>
                    </div>
                    <div className="item-detail-field">
                      <label className="item-detail-label">레어도:</label>
                      <span
                        className={`item-detail-rarity-text rarity-${item.rarity}`}
                      >
                        {item.rarity.toUpperCase()}
                      </span>
                    </div>
                    <div className="item-detail-field">
                      <label className="item-detail-label">설명 (한글):</label>
                      <span className="item-detail-value">{item.description[1]}</span>
                    </div>
                    <div className="item-detail-field">
                      <label className="item-detail-label">설명 (영문):</label>
                      <span className="item-detail-value">{item.description[0]}</span>
                    </div>

                    <div className="item-detail-section">
                      <h3 className="item-detail-section-title">속성 (Attributes)</h3>
                      {item.attributes?.length > 0 ? (
                        <>
                          <div className="item-detail-attr-header">
                            <span>STAT</span>
                            <span>OP</span>
                            <span>VALUE</span>
                          </div>
                          {item.attributes.map((attr, idx) => (
                            <div key={idx} className="item-detail-attr-display">
                              <span className="item-detail-attr-stat">{attr.stat}</span>
                              <span className="item-detail-attr-op">{attr.op}</span>
                              <span className="item-detail-attr-value">{attr.value}</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <span className="item-detail-no-data">속성 없음</span>
                      )}
                    </div>

                    <div className="item-detail-checkbox-display">
                      <span>Two-Hander: {item.twoHander ? "Yes" : "No"}</span>
                      <span>Stackable: {item.stackable ? "Yes" : "No"}</span>
                    </div>

                    <div className="item-detail-section">
                      <h3 className="item-detail-section-title">스킬 (Skills)</h3>
                      <div className="item-detail-skills-list">
                        {item.skills?.length > 0 ? (
                          item.skills.map((skill, idx) => (
                            <span key={idx} className="item-detail-skill-tag">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="item-detail-no-data">스킬 없음</span>
                        )}
                      </div>
                    </div>

                    <div className="item-detail-actions">
                      <button
                        className="item-detail-btn edit"
                        onClick={() => setIsEditing(true)}
                      >
                        수정
                      </button>
                      <button
                        className="item-detail-btn delete"
                        onClick={handleDelete}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  // 수정 모드
                  <div className="item-detail-edit-mode">
                    <div className="item-detail-field">
                      <label className="item-detail-label">ID:</label>
                      <input
                        type="text"
                        value={editData.id}
                        disabled
                        className="item-detail-input disabled"
                      />
                    </div>
                    <div className="item-detail-field">
                      <label className="item-detail-label">레어도:</label>
                      <select
                        className="item-detail-select"
                        value={editData.rarity}
                        onChange={(e) =>
                          setEditData({ ...editData, rarity: e.target.value })
                        }
                      >
                        <option value="common">Common</option>
                        <option value="uncommon">Uncommon</option>
                        <option value="rare">Rare</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Legendary</option>
                      </select>
                    </div>

                    <div className="item-detail-field">
                      <label className="item-detail-label">이름 (영문):</label>
                      <input
                        type="text"
                        value={editData.name[0]}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            name: [e.target.value, editData.name[1]],
                          })
                        }
                        className="item-detail-input"
                      />
                    </div>

                    <div className="item-detail-field">
                      <label className="item-detail-label">이름 (한글):</label>
                      <input
                        type="text"
                        value={editData.name[1]}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            name: [editData.name[0], e.target.value],
                          })
                        }
                        className="item-detail-input"
                      />
                    </div>

                    <div className="item-detail-field">
                      <label className="item-detail-label">설명 (영문):</label>
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
                        className="item-detail-textarea"
                      />
                    </div>

                    <div className="item-detail-field">
                      <label className="item-detail-label">설명 (한글):</label>
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
                        className="item-detail-textarea"
                      />
                    </div>

                    <div className="item-detail-section">
                      <h3 className="item-detail-section-title">속성 (Attributes)</h3>
                      <div className="item-detail-attr-header">
                        <span>STAT</span>
                        <span>OP</span>
                        <span>VALUE</span>
                        <span></span>
                      </div>
                      {editData.attributes.map((attr, index) => (
                        <div key={index} className="item-detail-attr-row">
                          <select
                            value={attr.stat}
                            onChange={(e) =>
                              handleAttributeChange(index, "stat", e.target.value)
                            }
                            className="item-detail-attr-select stat"
                          >
                            {[
                              "HP",
                              "ATK",
                              "ATS",
                              "DEF",
                              "CRI",
                              "CRID",
                              "SPD",
                              "JMP",
                              "JCNT",
                            ].map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <select
                            value={attr.op}
                            onChange={(e) =>
                              handleAttributeChange(index, "op", e.target.value)
                            }
                            className="item-detail-attr-select op"
                          >
                            <option value="ADD">ADD</option>
                            <option value="MUL">MUL</option>
                          </select>
                          <input
                            type="text"
                            placeholder="123.456"
                            value={attr.value}
                            onChange={(e) =>
                              handleAttributeChange(index, "value", e.target.value)
                            }
                            className="item-detail-attr-input"
                          />
                          <div className="item-detail-attr-buttons">
                            <button
                              type="button"
                              className="item-detail-attr-btn remove"
                              onClick={() => handleRemoveAttribute(index)}
                            >
                              −
                            </button>
                            <button
                              type="button"
                              className="item-detail-attr-btn add"
                              onClick={handleAddAttribute}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="item-detail-checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={editData.twoHander}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              twoHander: e.target.checked,
                            })
                          }
                        />
                        Two-Hander
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={editData.stackable}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              stackable: e.target.checked,
                            })
                          }
                        />
                        Stackable
                      </label>
                    </div>

                    {/* ✅ skills 입력 */}
                    <div className="item-detail-section">
                      <h3 className="item-detail-section-title">스킬 (Skills)</h3>
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="스킬1, 스킬2, 스킬3"
                        className="item-detail-input"
                      />
                      <small className="item-detail-hint">
                        콤마(,)로 구분하여 여러 스킬을 입력하세요.
                      </small>
                    </div>

                    <div className="item-detail-actions">
                      <button className="item-detail-btn save" onClick={handleSave}>
                        저장
                      </button>
                      <button
                        className="item-detail-btn cancel"
                        onClick={() => {
                          setIsEditing(false);
                          setEditData(item);
                          setSkillInput(item.skills.join(", "));
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              className="item-detail-back-btn"
              onClick={() => navigate("/admin/items")}
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

export default AdminItemDetail;
