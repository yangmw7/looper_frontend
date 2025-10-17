import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./AdminItemCreate.css";

function AdminItemCreate() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [editData, setEditData] = useState({
    id: "",
    rarity: "common",
    name: ["", ""],
    description: ["", ""],
    attributes: [
      { stat: "HP", op: "ADD", value: "" }
    ],
    twoHander: false,
    stackable: false,
    skills: [],
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleIdChange = (e) => {
    const value = e.target.value.replace(/[^0-9.\-]/g, "");
    setEditData({ ...editData, id: value });
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...editData.attributes];
    if (field === "value") {
      const numericValue = value.replace(/[^0-9.]/g, "");
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
      
      if (!file.type.startsWith('image/')) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
      }
      
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!editData.id.trim()) {
      alert("아이템 ID를 입력해주세요.");
      return;
    }

    if (!editData.name[0].trim() || !editData.name[1].trim()) {
      alert("모든 값을 입력해야 합니다.");
      return;
    }

    if (!editData.description[0].trim() || !editData.description[1].trim()) {
      alert("모든 값을 입력해야 합니다.");
      return;
    }

    for (let i = 0; i < editData.attributes.length; i++) {
      const attr = editData.attributes[i];
      if (!attr.value || attr.value.trim() === "") {
        alert("모든 값을 입력해야 합니다.");
        return;
      }
    }

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    try {
      const formData = new FormData();
      
      const itemData = {
        ...editData,
        attributes: editData.attributes.map((attr) => ({
          ...attr,
          value: parseFloat(attr.value) || 0,
        })),
      };
      
      formData.append('item', new Blob([JSON.stringify(itemData)], {
        type: 'application/json'
      }));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.post(`${API_BASE_URL}/api/items`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      alert("아이템이 추가되었습니다.");
      navigate("/admin/items");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || "";
        
        if (errorMessage.includes("duplicate") || 
            errorMessage.includes("already exists") || 
            errorMessage.includes("중복") ||
            errorMessage.includes("이미 존재")) {
          alert("ID가 중복되었습니다. 다른 ID를 입력해주세요.");
        } else {
          alert("잘못된 요청입니다. 입력 내용을 확인해주세요.");
        }
      } else if (err.response?.status === 409) {
        alert("ID가 중복되었습니다. 다른 ID를 입력해주세요.");
      } else {
        alert("아이템 추가 중 오류가 발생했습니다.");
      }
    }
  };

  const getItemImage = () => {
    if (imagePreview) {
      return imagePreview;
    }
    return "https://i.namu.wiki/i/77y-ptU__gqfagWpDS4YmvNGvE2tAbwFwUN0KZDYI2mbuReEb5AbFhK-3pZbswXTX3l4vii0pdQRgoJG35lHZg.webp";
  };

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <div className="item-create-header">
              <h2 className="admin-title">아이템 추가</h2>
            </div>

            <div className="item-create-layout">
              {/* 왼쪽: 이미지 섹션 */}
              <div className="item-create-left-panel">
                <div className="item-create-image-wrapper">
                  <img
                    src={getItemImage()}
                    alt={editData.name[1] || editData.name[0] || "New Item"}
                    className="item-create-image"
                  />
                </div>
                
                <div className={`item-create-rarity-badge rarity-${editData.rarity}`}>
                  {editData.rarity.toUpperCase()}
                </div>
                
                <div className="item-create-upload-section">
                  <label htmlFor="item-image-upload" className="item-create-upload-btn">
                    {imageFile ? '이미지 변경' : '이미지 업로드'}
                  </label>
                  <input
                    id="item-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="item-create-file-input"
                  />
                  {imageFile && (
                    <div className="item-create-file-info">
                      <p className="item-create-filename">
                        {imageFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="item-create-remove-btn"
                      >
                        이미지 제거
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 폼 섹션 */}
              <div className="item-create-right-panel">
                <div className="item-create-form">
                  {/* ID */}
                  <div className="item-create-field">
                    <label className="item-create-label">ID:</label>
                    <input
                      type="text"
                      value={editData.id}
                      onChange={handleIdChange}
                      placeholder="예) 01001"
                      className="item-create-input"
                    />
                  </div>

                  {/* 레어도 */}
                  <div className="item-create-field">
                    <label className="item-create-label">레어도:</label>
                    <select
                      className="item-create-select"
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

                  {/* 이름 영문 */}
                  <div className="item-create-field">
                    <label className="item-create-label">이름 (영문):</label>
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
                      className="item-create-input"
                    />
                  </div>

                  {/* 이름 한글 */}
                  <div className="item-create-field">
                    <label className="item-create-label">이름 (한글):</label>
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
                      className="item-create-input"
                    />
                  </div>

                  {/* 설명 영문 */}
                  <div className="item-create-field">
                    <label className="item-create-label">설명 (영문):</label>
                    <textarea
                      value={editData.description[0]}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: [e.target.value, editData.description[1]],
                        })
                      }
                      placeholder="English description"
                      className="item-create-textarea"
                    />
                  </div>

                  {/* 설명 한글 */}
                  <div className="item-create-field">
                    <label className="item-create-label">설명 (한글):</label>
                    <textarea
                      value={editData.description[1]}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          description: [editData.description[0], e.target.value],
                        })
                      }
                      placeholder="한글 설명"
                      className="item-create-textarea"
                    />
                  </div>

                  {/* 속성 섹션 */}
                  <div className="item-create-section">
                    <h3 className="item-create-section-title">속성 (Attributes)</h3>
                    
                    <div className="item-create-attr-header">
                      <span>STAT</span>
                      <span>OP</span>
                      <span>VALUE</span>
                      <span></span>
                    </div>

                    {editData.attributes.map((attr, index) => (
                      <div key={index} className="item-create-attr-row">
                        <select
                          value={attr.stat}
                          onChange={(e) =>
                            handleAttributeChange(index, "stat", e.target.value)
                          }
                          className="item-create-attr-select stat"
                        >
                          {["HP", "ATK", "ATS", "DEF", "CRI", "CRID", "SPD", "JMP", "JCNT"].map(
                            (s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            )
                          )}
                        </select>

                        <select
                          value={attr.op}
                          onChange={(e) =>
                            handleAttributeChange(index, "op", e.target.value)
                          }
                          className="item-create-attr-select op"
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
                          className="item-create-attr-input"
                        />

                        <div className="item-create-attr-buttons">
                          <button
                            type="button"
                            className="item-create-attr-btn remove"
                            onClick={() => handleRemoveAttribute(index)}
                            title="속성 제거"
                          >
                            −
                          </button>
                          <button
                            type="button"
                            className="item-create-attr-btn add"
                            onClick={handleAddAttribute}
                            title="속성 추가"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 체크박스 섹션 */}
                  <div className="item-create-checkbox-group">
                    <label className="item-create-checkbox-label">
                      <input
                        type="checkbox"
                        checked={editData.twoHander}
                        onChange={(e) =>
                          setEditData({ ...editData, twoHander: e.target.checked })
                        }
                        className="item-create-checkbox"
                      />
                      <span>Two-Hander</span>
                    </label>

                    <label className="item-create-checkbox-label">
                      <input
                        type="checkbox"
                        checked={editData.stackable}
                        onChange={(e) =>
                          setEditData({ ...editData, stackable: e.target.checked })
                        }
                        className="item-create-checkbox"
                      />
                      <span>Stackable</span>
                    </label>
                  </div>

                  {/* 스킬 섹션 */}
                  <div className="item-create-section">
                    <h3 className="item-create-section-title">스킬 (Skills)</h3>
                    <input
                      type="text"
                      value={editData.skills.join(", ")}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          skills: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s),
                        })
                      }
                      placeholder="스킬1, 스킬2, 스킬3"
                      className="item-create-input"
                    />
                  </div>

                  {/* 버튼 그룹 */}
                  <div className="item-create-actions">
                    <button className="item-create-btn save" onClick={handleSave}>
                      저장
                    </button>
                    <button
                      className="item-create-btn cancel"
                      onClick={() => navigate("/admin/items")}
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="item-create-back-btn"
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

export default AdminItemCreate;