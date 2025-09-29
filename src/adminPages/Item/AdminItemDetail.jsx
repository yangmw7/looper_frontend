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
    attributes: [
      { stat: "HP", op: "ADD", value: "" }
    ],
    twoHander: false,
    stackable: false,
    skills: [],
  });

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    axios
      .get(`${API_BASE_URL}/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        console.log("Raw data from API:", data);
        console.log("data.attributes type:", typeof data.attributes);
        console.log("data.attributes value:", data.attributes);

        const parsedName = Array.isArray(data.name)
          ? data.name
          : JSON.parse(data.name || "[]");
        const parsedDescription = Array.isArray(data.description)
          ? data.description
          : JSON.parse(data.description || "[]");
        
        let parsedAttributes;
        
        // 먼저 문자열인 경우 파싱
        let attrData = data.attributes;
        if (typeof attrData === "string") {
          try {
            attrData = JSON.parse(attrData);
            console.log("Parsed attributes from string:", attrData);
          } catch (e) {
            console.error("Failed to parse attributes:", e);
            attrData = {};
          }
        }

        // 파싱된 데이터가 배열인지 객체인지 확인
        if (Array.isArray(attrData)) {
          // 배열인 경우 stat을 대문자로 변환
          parsedAttributes = attrData.map(attr => ({
            ...attr,
            stat: attr.stat.toUpperCase()
          }));
        } else if (typeof attrData === "object" && attrData !== null) {
          // 객체 형태를 배열 형태로 변환
          parsedAttributes = Object.entries(attrData)
            .filter(([key, value]) => 
              !["twoHander", "stackable"].includes(key) && 
              (typeof value === "number" && value !== 0)
            )
            .map(([key, value]) => ({
              stat: key.toUpperCase(),
              op: "ADD",
              value: value
            }));
        } else {
          parsedAttributes = [];
        }
        
        console.log("Final parsedAttributes:", parsedAttributes);

        const parsedSkills = Array.isArray(data.skills)
          ? data.skills
          : JSON.parse(data.skills || "[]");

        const formattedData = {
          ...data,
          name: parsedName,
          description: parsedDescription,
          attributes: parsedAttributes.length > 0 ? parsedAttributes : [{ stat: "HP", op: "ADD", value: "" }],
          twoHander: data.twoHander || data.attributes?.twoHander || false,
          stackable: data.stackable || data.attributes?.stackable || false,
          skills: parsedSkills,
        };

        setItem(formattedData);
        setEditData(formattedData);
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
      if (!attr.value || attr.value.toString().trim() === "") {
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

      await axios.put(`${API_BASE_URL}/api/items/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setItem(editData);
      setIsEditing(false);
      alert("아이템이 수정되었습니다.");
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

  const getItemImage = (itemId) => {
    return "https://search.pstatic.net/sunny/?src=https%3A%2F%2Fi.namu.wiki%2Fi%2F77y-ptU__gqfagWpDS4YmvNGvE2tAbwFwUN0KZDYI2mbuReEb5AbFhK-3pZbswXTX3l4vii0pdQRgoJG35lHZg.webp&type=sc960_832";
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
            <div className="detail-header">
              <h2 className="admin-title">아이템 상세정보</h2>
            </div>

            <div className="item-detail-content">
              <div className="item-detail-left">
                <div className="item-detail-image">
                  <img
                    src={getItemImage(item.id)}
                    alt={editData.name[1] || editData.name[0]}
                  />
                </div>
                <div className={`item-rarity-badge ${item.rarity}`}>
                  {item.rarity.toUpperCase()}
                </div>
              </div>

              <div className="item-detail-right">
                {!isEditing ? (
                  <>
                    <div className="detail-row">
                      <label>ID:</label>
                      <span>{item.id}</span>
                    </div>
                    <div className="detail-row">
                      <label>이름 (한글):</label>
                      <span>{item.name[1]}</span>
                    </div>
                    <div className="detail-row">
                      <label>이름 (영문):</label>
                      <span>{item.name[0]}</span>
                    </div>
                    <div className="detail-row">
                      <label>레어도:</label>
                      <span className={`rarity-text ${item.rarity}`}>
                        {item.rarity}
                      </span>
                    </div>
                    <div className="detail-row">
                      <label>설명 (한글):</label>
                      <span>{item.description[1]}</span>
                    </div>
                    <div className="detail-row">
                      <label>설명 (영문):</label>
                      <span>{item.description[0]}</span>
                    </div>

                    <div className="detail-section">
                      <h3>속성 (Attributes)</h3>
                      {item.attributes && item.attributes.length > 0 ? (
                        <>
                          <div className="attribute-header">
                            <span>STAT</span>
                            <span>OP</span>
                            <span>VALUE</span>
                          </div>
                          {item.attributes.map((attr, idx) => (
                            <div key={idx} className="attribute-display">
                              <span className="attr-stat">{attr.stat}</span>
                              <span className="attr-op">{attr.op}</span>
                              <span className="attr-value">{attr.value}</span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <span className="no-data">속성 없음</span>
                      )}
                    </div>

                    <div className="checkbox-section">
                      <div className="checkbox-item">
                        <label className="checkbox-label-display">
                          Two-Hander: {item.twoHander ? "Yes" : "No"}
                        </label>
                      </div>
                      <div className="checkbox-item">
                        <label className="checkbox-label-display">
                          Stackable: {item.stackable ? "Yes" : "No"}
                        </label>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>스킬 (Skills)</h3>
                      <div className="skills-list">
                        {item.skills.length > 0 ? (
                          item.skills.map((skill, idx) => (
                            <span key={idx} className="skill-tag">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="no-data">스킬 없음</span>
                        )}
                      </div>
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
                            description: [e.target.value, editData.description[1]],
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
                            description: [editData.description[0], e.target.value],
                          })
                        }
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
                              ＋
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
                        onClick={() => {
                          setIsEditing(false);
                          setEditData(item);
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