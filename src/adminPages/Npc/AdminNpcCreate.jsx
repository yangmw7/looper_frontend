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

  const handleSave = async () => {
    // ID 검증
    if (!editData.id.trim()) {
      alert("NPC ID를 입력해주세요.");
      return;
    }

    // 이름 검증
    if (!editData.name[0].trim() || !editData.name[1].trim()) {
      alert("모든 값을 입력해야 합니다.");
      return;
    }

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    try {
      const payload = { ...editData };

      await axios.post(`${API_BASE_URL}/api/npcs`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("NPC가 추가되었습니다.");
      navigate("/admin/npcs");
    } catch (err) {
      console.error("NPC 생성 에러:", err);
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
      } else if (err.response?.status === 401) {
        alert("인증이 필요합니다. 다시 로그인해주세요.");
        navigate("/login");
      } else if (err.response?.status === 403) {
        alert("관리자 권한이 필요합니다.");
      } else {
        alert("NPC 추가 중 오류가 발생했습니다.");
      }
    }
  };

  const getNpcImage = () => {
    return "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA0MjBfMjcy%2FMDAxNzEzNjE4MDk2NDMy.TJo5oSAsFzMeDKScAZZZWxLGY_Xj4QbTK_VPMcmgmrgg.MWbdnjNykHVl4kc0sv8hGD-Ju5GeaeCM5EmUmgKQcQsg.PNG%2F12.PNG&type=a340";
  };

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <div className="detail-header">
              <h2 className="admin-title">NPC 추가</h2>
            </div>

            <div className="npc-detail-content">
              <div className="npc-detail-left">
                <div className="npc-detail-image">
                  <img
                    src={getNpcImage()}
                    alt={editData.name[1] || editData.name[0] || "New NPC"}
                  />
                </div>
              </div>

              <div className="npc-detail-right">
                <div className="detail-row">
                  <label>ID:</label>
                  <input
                    type="text"
                    value={editData.id}
                    onChange={(e) =>
                      setEditData({ ...editData, id: e.target.value })
                    }
                    placeholder="예: 10001"
                  />
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

                <div className="detail-section">
                  <h3>속성 (Attributes)</h3>
                  <div className="attributes-grid">
                    <div className="attribute-item">
                      <label>HP:</label>
                      <input
                        type="number"
                        value={editData.hp}
                        onChange={(e) =>
                          setEditData({ ...editData, hp: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="attribute-item">
                      <label>ATK:</label>
                      <input
                        type="number"
                        value={editData.atk}
                        onChange={(e) =>
                          setEditData({ ...editData, atk: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="attribute-item">
                      <label>DEF:</label>
                      <input
                        type="number"
                        value={editData.def}
                        onChange={(e) =>
                          setEditData({ ...editData, def: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="attribute-item">
                      <label>SPD:</label>
                      <input
                        type="number"
                        value={editData.spd}
                        onChange={(e) =>
                          setEditData({ ...editData, spd: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>특징 (Features)</h3>
                  <div className="detail-row">
                    <input
                      type="text"
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

                <div className="button-group">
                  <button className="save-button" onClick={handleSave}>
                    저장
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => navigate("/admin/npcs")}
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>

            <button
              className="back-button bottom-left"
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