import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './AdminNpcDetail.css';

function AdminNpcDetail() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [npc, setNpc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    name: ['', ''],
    hp: 0,
    atk: 0,
    def: 0,
    spd: 0,
    features: [],
  });

  const getNpcImage = () => {
    return "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyNDA0MjBfMjcy%2FMDAxNzEzNjE4MDk2NDMy.TJo5oSAsFzMeDKScAZZZWxLGY_Xj4QbTK_VPMcmgmrgg.MWbdnjNykHVl4kc0sv8hGD-Ju5GeaeCM5EmUmgKQcQsg.PNG%2F12.PNG&type=a340";
  };

  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    axios
      .get(`${API_BASE_URL}/api/npcs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;

        let parsedName = ['', ''];
        if (Array.isArray(data.name)) {
          parsedName = data.name;
        } else {
          try {
            const tmp = JSON.parse(data.name);
            if (Array.isArray(tmp)) parsedName = tmp;
            else parsedName = [tmp, ''];
          } catch {
            parsedName = [data.name || '', ''];
          }
        }

        const parsedFeatures = Array.isArray(data.features)
          ? data.features
          : JSON.parse(data.features || '[]');

        const formattedData = {
          ...data,
          name: parsedName,
          features: parsedFeatures,
        };

        setNpc(formattedData);
        setEditData(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    // 이름 검증
    if (!editData.name[0].trim() || !editData.name[1].trim()) {
      alert("모든 값을 입력해야 합니다.");
      return;
    }

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    try {
      await axios.put(`${API_BASE_URL}/api/npcs/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNpc(editData);
      setIsEditing(false);
      alert('NPC가 수정되었습니다.');
    } catch (err) {
      console.error(err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 NPC를 삭제하시겠습니까?')) return;

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    try {
      await axios.delete(`${API_BASE_URL}/api/npcs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('NPC가 삭제되었습니다.');
      navigate('/admin/npcs');
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error-message">에러 발생: {error.message}</div>;
  if (!npc) return <div className="error-message">NPC를 찾을 수 없습니다.</div>;

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <div className="detail-header">
              <h2 className="admin-title">NPC 상세정보</h2>
            </div>

            <div className="npc-detail-content">
              <div className="npc-detail-left">
                <div className="npc-detail-image">
                  <img
                    src={getNpcImage()}
                    alt={npc.name[1] || npc.name[0] || 'NPC'}
                  />
                </div>
              </div>

              <div className="npc-detail-right">
                {!isEditing ? (
                  <>
                    <div className="detail-row"><label>ID:</label><span>{npc.id}</span></div>
                    <div className="detail-row"><label>이름 (영문):</label><span>{npc.name[0]}</span></div>
                    <div className="detail-row"><label>이름 (한글):</label><span>{npc.name[1]}</span></div>

                    <div className="detail-section">
                      <h3>속성 (Attributes)</h3>
                      <div className="attributes-grid">
                        <div className="attribute-item"><label>HP:</label><span>{npc.hp}</span></div>
                        <div className="attribute-item"><label>ATK:</label><span>{npc.atk}</span></div>
                        <div className="attribute-item"><label>DEF:</label><span>{npc.def}</span></div>
                        <div className="attribute-item"><label>SPD:</label><span>{npc.spd}</span></div>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>특징 (Features)</h3>
                      <div className="skills-list">
                        {npc.features.length > 0 ? (
                          npc.features.map((f, idx) => (
                            <span key={idx} className="skill-tag">{f}</span>
                          ))
                        ) : (
                          <span className="no-data">특징 없음</span>
                        )}
                      </div>
                    </div>

                    <div className="button-group">
                      <button className="edit-button" onClick={() => setIsEditing(true)}>수정</button>
                      <button className="delete-button" onClick={handleDelete}>삭제</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="detail-row"><label>ID:</label><input type="text" value={editData.id} disabled /></div>
                    <div className="detail-row"><label>이름 (영문):</label>
                      <input type="text" value={editData.name[0]}
                        onChange={(e) => setEditData({ ...editData, name: [e.target.value, editData.name[1]] })} />
                    </div>
                    <div className="detail-row"><label>이름 (한글):</label>
                      <input type="text" value={editData.name[1]}
                        onChange={(e) => setEditData({ ...editData, name: [editData.name[0], e.target.value] })} />
                    </div>

                    <div className="detail-section">
                      <h3>속성 (Attributes)</h3>
                      <div className="attributes-grid">
                        {["hp","atk","def","spd"].map(attr => (
                          <div key={attr} className="attribute-item">
                            <label>{attr.toUpperCase()}:</label>
                            <input type="number" value={editData[attr]}
                              onChange={(e) => setEditData({ ...editData, [attr]: parseFloat(e.target.value) || 0 })} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>특징 (Features)</h3>
                      <div className="detail-row">
                        <input type="text" value={editData.features.join(', ')}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              features: e.target.value.split(',').map((f) => f.trim()).filter((f) => f),
                            })
                          }
                          placeholder="예: 불속성, 보스, 원거리"
                        />
                      </div>
                    </div>

                    <div className="button-group">
                      <button className="save-button" onClick={handleSave}>저장</button>
                      <button className="cancel-button" onClick={() => { setIsEditing(false); setEditData(npc); }}>취소</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button className="back-button bottom-left" onClick={() => navigate('/admin/npcs')}>
              ← 목록으로
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminNpcDetail;