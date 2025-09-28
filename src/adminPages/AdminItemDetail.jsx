import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
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
    attributes: {
      atk: 0,
      ats: 0,
      def: 0,
      cri: 0,
      crid: 0,
      spd: 0,
      jmp: 0,
      twoHander: false,
    },
    skills: [],
  });

  // 아이템 데이터 불러오기
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

        const parsedName = Array.isArray(data.name)
          ? data.name
          : JSON.parse(data.name || "[]");
        const parsedDescription = Array.isArray(data.description)
          ? data.description
          : JSON.parse(data.description || "[]");
        const parsedAttributes =
          typeof data.attributes === "object"
            ? data.attributes
            : JSON.parse(data.attributes || "{}");
        const parsedSkills = Array.isArray(data.skills)
          ? data.skills
          : JSON.parse(data.skills || "[]");

        const mergedAttributes = {
          atk: parsedAttributes.atk || 0,
          ats: parsedAttributes.ats || 0,
          def: parsedAttributes.def || 0,
          cri: parsedAttributes.cri || 0,
          crid: parsedAttributes.crid || 0,
          spd: parsedAttributes.spd || 0,
          jmp: parsedAttributes.jmp || 0,
          twoHander: parsedAttributes.twoHander || false,
        };

        const formattedData = {
          ...data,
          name: parsedName,
          description: parsedDescription,
          attributes: mergedAttributes,
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

  const handleSave = async () => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    try {
      const payload = {
        ...editData,
        name: editData.name,
        description: editData.description,
        attributes: JSON.stringify(editData.attributes),
        skills: editData.skills,
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
                      <div className="attributes-grid">
                        {Object.entries(item.attributes).map(([key, value]) => (
                          <div key={key} className="attribute-item">
                            <span className="attr-key">{key.toUpperCase()}:</span>
                            <span className="attr-value">
                              {typeof value === "boolean"
                                ? value
                                  ? "Yes"
                                  : "No"
                                : value}
                            </span>
                          </div>
                        ))}
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
                      <div className="attributes-grid">
                        {["atk", "ats", "def", "cri", "crid", "spd", "jmp"].map(
                          (attr) => (
                            <div key={attr} className="attribute-item">
                              <label>{attr.toUpperCase()}:</label>
                              <input
                                type="number"
                                value={editData.attributes[attr]}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    attributes: {
                                      ...editData.attributes,
                                      [attr]: parseFloat(e.target.value) || 0,
                                    },
                                  })
                                }
                              />
                            </div>
                          )
                        )}
                        <div className="attribute-item">
                          <label className="checkbox-label">
                            Two-Hander:
                            <input
                              type="checkbox"
                              checked={editData.attributes.twoHander}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  attributes: {
                                    ...editData.attributes,
                                    twoHander: e.target.checked,
                                  },
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="detail-row">
                      <label>스킬 (콤마 구분):</label>
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

            {/* 목록으로 버튼 왼쪽 하단 */}
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
