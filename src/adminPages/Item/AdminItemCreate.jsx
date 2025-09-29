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
    attributes: {
      atk: 0,
      ats: 0,
      def: 0,
      cri: 0,
      crid: 0,
      spd: 0,
      jmp: 0,
      jcnt: 0,
      twoHander: false,
      stackable: false,
    },
    skills: [],
  });

  const handleSave = async () => {
    if (!editData.id.trim()) {
      alert("아이템 ID를 입력해주세요.");
      return;
    }

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

      await axios.post(`${API_BASE_URL}/api/items`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("아이템이 추가되었습니다.");
      navigate("/admin/items");
    } catch (err) {
      console.error(err);
      alert("아이템 추가 중 오류가 발생했습니다.");
    }
  };

  const getItemImage = () => {
    return "https://search.pstatic.net/sunny/?src=https%3A%2F%2Fi.namu.wiki%2Fi%2F77y-ptU__gqfagWpDS4YmvNGvE2tAbwFwUN0KZDYI2mbuReEb5AbFhK-3pZbswXTX3l4vii0pdQRgoJG35lHZg.webp&type=sc960_832";
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
                    onChange={(e) =>
                      setEditData({ ...editData, id: e.target.value })
                    }
                    placeholder="예: 01002"
                  />
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
                  <div className="attributes-grid">
                    {["atk", "ats", "def", "cri", "crid", "spd", "jmp", "jcnt"].map(
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
                    <div className="attribute-item">
                      <label className="checkbox-label">
                        Stackable:
                        <input
                          type="checkbox"
                          checked={editData.attributes.stackable}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              attributes: {
                                ...editData.attributes,
                                stackable: e.target.checked,
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
                    placeholder="스킬1, 스킬2, 스킬3"
                  />
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
