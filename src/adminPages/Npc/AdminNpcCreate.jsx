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
    name: ["", ""], // [영문, 한글]
    hp: 0,
    atk: 0,
    def: 0,
    spd: 0,
    features: [],
  });

  const handleSave = async () => {
    if (!editData.id.trim()) {
      alert("NPC ID를 입력해주세요.");
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
      if (err.response) {
        switch (err.response.status) {
          case 409:
            alert("이미 존재하는 NPC ID입니다.");
            break;
          case 401:
            alert("인증이 필요합니다. 다시 로그인해주세요.");
            navigate("/login");
            break;
          case 403:
            alert("관리자 권한이 필요합니다.");
            break;
          default:
            alert(`오류가 발생했습니다. (${err.response.status})`);
        }
      } else {
        alert("네트워크 오류 또는 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  const getNpcImage = () => {
    return "https://i.namu.wiki/i/xpQatdbCF5G0mhclJgY0oNQU3UtAFhh8nL2McgZh1K-4i7a-IXgMN3BknUrnAq2Y6o7LQae2ZV7avX6Rt0MDiQ.webp";
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
                    placeholder="예: npc_001"
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
                <div className="detail-row">
                  <label>HP:</label>
                  <input
                    type="number"
                    value={editData.hp}
                    onChange={(e) =>
                      setEditData({ ...editData, hp: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="detail-row">
                  <label>ATK:</label>
                  <input
                    type="number"
                    value={editData.atk}
                    onChange={(e) =>
                      setEditData({ ...editData, atk: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="detail-row">
                  <label>DEF:</label>
                  <input
                    type="number"
                    value={editData.def}
                    onChange={(e) =>
                      setEditData({ ...editData, def: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="detail-row">
                  <label>SPD:</label>
                  <input
                    type="number"
                    value={editData.spd}
                    onChange={(e) =>
                      setEditData({ ...editData, spd: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="detail-row">
                  <label>특징 (콤마 구분):</label>
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
