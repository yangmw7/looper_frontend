import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
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
      twoHander: false,
    },
    skills: [],
  });

  const handleSave = async () => {
    console.log("=== HANDLE SAVE START ===");
    console.log("editData:", editData);
    
    // 필수 값 검증
    if (!editData.id.trim()) {
      alert("아이템 ID를 입력해주세요.");
      return;
    }

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    console.log("Token:", token ? "존재함" : "없음");
    console.log("API_BASE_URL:", API_BASE_URL);

    try {
      const payload = {
        ...editData,
        name: editData.name,
        description: editData.description,
        attributes: JSON.stringify(editData.attributes),
        skills: editData.skills,
      };

      console.log("Request payload:", payload);
      console.log("Request URL:", `${API_BASE_URL}/api/items`);

      const response = await axios.post(`${API_BASE_URL}/api/items`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Success response:", response);
      alert("아이템이 추가되었습니다.");
      navigate("/admin/items");
    } catch (err) {
      console.error("=== ERROR DETAILS ===");
      console.error("Full error:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Request config:", err.config);
      
      // 에러 응답 상태 코드에 따른 구체적인 처리
      if (err.response) {
        switch (err.response.status) {
          case 409:
            // 중복 ID 에러 (Conflict)
            alert(`${err.response.data.error || err.response.data || '이미 존재하는 아이템 ID입니다.'}`);
            break;
          case 400:
            // 잘못된 요청 (Bad Request)
            alert("잘못된 요청입니다. 입력 값을 확인해주세요.");
            break;
          case 401:
            // 권한 없음 (Unauthorized)
            alert("인증이 필요합니다. 다시 로그인해주세요.");
            navigate("/login");
            break;
          case 403:
            // 접근 금지 (Forbidden)
            alert("관리자 권한이 필요합니다.");
            break;
          case 500:
            // 서버 내부 오류
            alert("서버 오류가 발생했습니다. 관리자에게 문의하세요.");
            break;
          default:
            // 기타 HTTP 에러
            alert(`오류가 발생했습니다. (${err.response.status})`);
        }
      } else if (err.request) {
        // 네트워크 오류
        alert("네트워크 연결을 확인해주세요.");
      } else {
        // 기타 오류
        alert("알 수 없는 오류가 발생했습니다.");
      }
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