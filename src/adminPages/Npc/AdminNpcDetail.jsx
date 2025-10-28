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

  // 이미지 업로드 관련 state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    axios
      .get(`${API_BASE_URL}/api/npcs/${id}/admin`, {
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
            parsedName = Array.isArray(tmp) ? tmp : [tmp, ''];
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

  // 이미지 선택 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 이미지 제거
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!editData.name[0].trim() || !editData.name[1].trim()) {
      alert('이름(영문/한글)을 모두 입력해주세요.');
      return;
    }

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    try {
      const formData = new FormData();
      const npcData = { ...editData };

      formData.append(
        'npc',
        new Blob([JSON.stringify(npcData)], { type: 'application/json' })
      );

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.put(`${API_BASE_URL}/api/npcs/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('NPC가 수정되었습니다.');
      window.location.reload();
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

  const getNpcImage = () => {
    if (imagePreview) return imagePreview;
    if (npc?.imageUrl) return npc.imageUrl;
    return 'https://i.namu.wiki/i/77y-ptU__gqfagWpDS4YmvNGvE2tAbwFwUN0KZDYI2mbuReEb5AbFhK-3pZbswXTX3l4vii0pdQRgoJG35lHZg.webp';
  };

  if (loading) return <div className="npc-detail-loading">로딩 중...</div>;
  if (error) return <div className="npc-detail-error">에러 발생: {error.message}</div>;
  if (!npc) return <div className="npc-detail-error">NPC를 찾을 수 없습니다.</div>;

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            {/* 헤더 */}
            <h2 className="npc-detail-title">NPC 상세정보</h2>

            {/* 메인 컨테이너 */}
            <div className="npc-detail-container">
              {/* 왼쪽 - 이미지 */}
              <div className="npc-detail-left">
                <div className="npc-detail-image-box">
                  <img
                    src={getNpcImage()}
                    alt={npc.name[1] || npc.name[0] || 'NPC'}
                  />
                </div>

                {isEditing && (
                  <button
                    className="npc-detail-upload-button"
                    onClick={() => document.getElementById('npc-detail-image-upload').click()}
                  >
                    이미지 업로드
                  </button>
                )}
                <input
                  id="npc-detail-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* 오른쪽 - 폼 */}
              <div className="npc-detail-right">
                {/* ID */}
                <div className="npc-detail-row">
                  <label>ID:</label>
                  {!isEditing ? (
                    <div className="npc-detail-value">{npc.id}</div>
                  ) : (
                    <input
                      type="text"
                      value={editData.id}
                      disabled
                    />
                  )}
                </div>

                {/* 이름 (영문) */}
                <div className="npc-detail-row">
                  <label>이름 (영문):</label>
                  {!isEditing ? (
                    <div className="npc-detail-value">{npc.name[0]}</div>
                  ) : (
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
                  )}
                </div>

                {/* 이름 (한글) */}
                <div className="npc-detail-row">
                  <label>이름 (한글):</label>
                  {!isEditing ? (
                    <div className="npc-detail-value">{npc.name[1]}</div>
                  ) : (
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
                  )}
                </div>

                {/* 속성 */}
                <div className="npc-detail-divider"></div>
                <h3 className="npc-detail-subtitle">속성 (Attributes)</h3>

                <div className="npc-detail-stats-grid">
                  <div className="npc-detail-stat-item">
                    <label>HP:</label>
                    {!isEditing ? (
                      <div className="npc-detail-stat-value">{npc.hp}</div>
                    ) : (
                      <input
                        type="number"
                        value={editData.hp}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            hp: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    )}
                  </div>
                  <div className="npc-detail-stat-item">
                    <label>ATK:</label>
                    {!isEditing ? (
                      <div className="npc-detail-stat-value">{npc.atk}</div>
                    ) : (
                      <input
                        type="number"
                        value={editData.atk}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            atk: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    )}
                  </div>
                  <div className="npc-detail-stat-item">
                    <label>DEF:</label>
                    {!isEditing ? (
                      <div className="npc-detail-stat-value">{npc.def}</div>
                    ) : (
                      <input
                        type="number"
                        value={editData.def}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            def: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    )}
                  </div>
                  <div className="npc-detail-stat-item">
                    <label>SPD:</label>
                    {!isEditing ? (
                      <div className="npc-detail-stat-value">{npc.spd}</div>
                    ) : (
                      <input
                        type="number"
                        value={editData.spd}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            spd: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    )}
                  </div>
                </div>

                {/* 특징 */}
                <div className="npc-detail-divider"></div>
                <h3 className="npc-detail-subtitle">특징 (Features)</h3>

                {!isEditing ? (
                  <div className="npc-detail-features-view">
                    {npc.features.length > 0 ? (
                      npc.features.map((f, idx) => (
                        <span key={idx} className="npc-detail-feature-tag">{f}</span>
                      ))
                    ) : (
                      <span className="npc-detail-no-data">특징 없음</span>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="npc-detail-features-input"
                    value={editData.features.join(', ')}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        features: e.target.value
                          .split(',')
                          .map((f) => f.trim())
                          .filter((f) => f),
                      })
                    }
                    placeholder="예: 불속성, 보스, 원거리"
                  />
                )}

                {/* 버튼 */}
                <div className="npc-detail-divider"></div>
                <div className="npc-detail-buttons">
                  {!isEditing ? (
                    <>
                      <button className="npc-detail-edit-btn" onClick={() => setIsEditing(true)}>
                        수정
                      </button>
                      <button className="npc-detail-delete-btn" onClick={handleDelete}>
                        삭제
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="npc-detail-save-btn" onClick={handleSave}>
                        저장
                      </button>
                      <button
                        className="npc-detail-cancel-btn"
                        onClick={() => {
                          setIsEditing(false);
                          setEditData(npc);
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        취소
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 뒤로 가기 */}
            <button
              className="npc-detail-back-btn"
              onClick={() => navigate('/admin/npcs')}
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

export default AdminNpcDetail;