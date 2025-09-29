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

  const handleIdChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
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

  const handleSave = async () => {
    // ID 검증
    if (!editData.id.trim()) {
      alert("아이템 ID를 입력해주세요.");
      return;
    }

    // 이름 검증
    if (!editData.name[0].trim() || !editData.name[1].trim()) {
      alert("모든 값을 입력해야 합니다.");
      return;
    }

    // 설명 검증
    if (!editData.description[0].trim() || !editData.description[1].trim()) {
      alert("모든 값을 입력해야 합니다.");
      return;
    }

    // Attributes 검증
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
      const payload = {
        ...editData,
        attributes: editData.attributes.map((attr) => ({
          ...attr,
          value: parseFloat(attr.value) || 0,
        })),
      };

      await axios.post(`${API_BASE_URL}/api/items`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("아이템이 추가되었습니다.");
      navigate("/admin/items");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 400) {
        // 백엔드에서 보내는 에러 메시지 확인
        const errorMessage = err.response?.data?.message || err.response?.data?.error || "";
        
        // ID 중복 관련 키워드 확인
        if (errorMessage.includes("duplicate") || 
            errorMessage.includes("already exists") || 
            errorMessage.includes("중복") ||
            errorMessage.includes("이미 존재")) {
          alert("ID가 중복되었습니다. 다른 ID를 입력해주세요.");
        } else {
          alert("잘못된 요청입니다. 입력 내용을 확인해주세요.");
        }
      } else if (err.response?.status === 409) {
        // 409 Conflict는 일반적으로 중복을 나타냄
        alert("ID가 중복되었습니다. 다른 ID를 입력해주세요.");
      } else {
        alert("아이템 추가 중 오류가 발생했습니다.");
      }
    }
  };

  const getItemImage = () => {
    return "https://i.namu.wiki/i/77y-ptU__gqfagWpDS4YmvNGvE2tAbwFwUN0KZDYI2mbuReEb5AbFhK-3pZbswXTX3l4vii0pdQRgoJG35lHZg.webp";
  };

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <div className="detail-header">
              <h2 className="admin-title">아이템 추가</h2>
            </div>

            <div className="item-detail-content">
              <div className="item-detail-left">
                <div className="item-detail-image">
                  <img
                    src={getItemImage()}
                    alt={editData.name[1] || editData.name[0] || "New Item"}
                  />
                </div>
                <div className={`item-rarity-badge ${editData.rarity}`}>
                  {editData.rarity.toUpperCase()}
                </div>
              </div>

              <div className="item-detail-right">
                <div className="detail-row">
                  <label>ID:</label>
                  <input
                    type="text"
                    value={editData.id}
                    onChange={handleIdChange}
                    placeholder="ex) 01001"
                  />
                </div>

                <div className="detail-row">
                  <label>레어도:</label>
                  <select
                    className="rarity-select"
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
                    placeholder="English description"
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
                    placeholder="한글 설명"
                  />
                </div>

                <div className="detail-section">
                  <h3>속성 (Attributes)</h3>
                  <div className="attribute-header">
                    <span>STAT</span>
                    <span>OP</span>
                    <span>VALUE</span>
                  </div>

                  {editData.attributes.map((attr, index) => (
                    <div key={index} className="attribute-row">
                      <select
                        value={attr.stat}
                        onChange={(e) =>
                          handleAttributeChange(index, "stat", e.target.value)
                        }
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
                      />

                      <div className="attr-btn-group">
                        <button
                          type="button"
                          className="remove-attr-btn"
                          onClick={() => handleRemoveAttribute(index)}
                        >
                          −
                        </button>
                        <button
                          type="button"
                          className="add-attr-btn"
                          onClick={handleAddAttribute}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="checkbox-section">
                  <div className="checkbox-item">
                    <label className="checkbox-label">
                      Two-Hander:
                      <input
                        type="checkbox"
                        checked={editData.twoHander}
                        onChange={(e) =>
                          setEditData({ ...editData, twoHander: e.target.checked })
                        }
                      />
                    </label>
                  </div>
                  <div className="checkbox-item">
                    <label className="checkbox-label">
                      Stackable:
                      <input
                        type="checkbox"
                        checked={editData.stackable}
                        onChange={(e) =>
                          setEditData({ ...editData, stackable: e.target.checked })
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>스킬 (Skills)</h3>
                  <div className="detail-row">
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
                    />
                  </div>
                </div>

                <div className="button-group">
                  <button className="save-button" onClick={handleSave}>
                    저장
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => navigate("/admin/items")}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>

            <button
              className="back-button bottom-left"
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