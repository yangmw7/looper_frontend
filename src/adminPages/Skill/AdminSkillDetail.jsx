import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './AdminSkillDetail.css';

function AdminSkillDetail() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    id: '',
    name: ['', ''],
    description: ['', ''],
  });

  const getSkillImage = () => {
    return "https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMTEyMTZfNDAg%2FMDAxNjM5NjQxNzUxMDc5.8Z45VaLbczbt6T0CnwI5852sOiWcu9zqPby1vdSSVJ0g.wFZHYWgSfK9TsAXqEPG71DPVaz1USCDCw0aImGSBhAcg.PNG.glory8743%2F1231312.png&type=sc960_832";
  };

  // 데이터 로드
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/skills/${id}`)
      .then((res) => {
        const data = res.data;

        // name/description이 배열인지 아닌지 체크
        const parsedName = Array.isArray(data.name)
          ? data.name
          : typeof data.name === 'string'
            ? JSON.parse(data.name)
            : [data.name || '', ''];

        const parsedDescription = Array.isArray(data.description)
          ? data.description
          : typeof data.description === 'string'
            ? JSON.parse(data.description)
            : [data.description || '', ''];

        const formattedData = {
          ...data,
          name: parsedName,
          description: parsedDescription,
        };

        setSkill(formattedData);
        setEditData(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      });
  }, [id]);

  // 저장
  const handleSave = async () => {
    if (!editData.name[0].trim() || !editData.name[1].trim()) {
      alert('이름(영문/한글)을 모두 입력하세요.');
      return;
    }
    if (!editData.description[0].trim() || !editData.description[1].trim()) {
      alert('설명(영문/한글)을 모두 입력하세요.');
      return;
    }

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    try {
      const response = await axios.put(`${API_BASE_URL}/api/skills/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('저장 성공:', response.data);
      setSkill(editData);
      setIsEditing(false);
      alert('스킬이 수정되었습니다.');
    } catch (err) {
      console.error('저장 실패:', err.response || err);
      alert(
        err.response?.data?.error ||
          err.message ||
          '수정 중 오류가 발생했습니다.'
      );
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 이 스킬을 삭제하시겠습니까?')) return;

    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');

    try {
      await axios.delete(`${API_BASE_URL}/api/skills/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('스킬이 삭제되었습니다.');
      navigate('/admin/skills');
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.error ||
          err.message ||
          '삭제 중 오류가 발생했습니다.'
      );
    }
  };

  if (loading) return <div className="loading">로딩 중...</div>;
  if (error) return <div className="error-message">에러 발생: {error}</div>;
  if (!skill) return <div className="error-message">스킬을 찾을 수 없습니다.</div>;

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-page">
          <div className="admin-container">
            <div className="detail-header">
              <h2 className="admin-title">스킬 상세정보</h2>
            </div>

            <div className="skill-detail-content">
              <div className="skill-detail-left">
                <div className="skill-detail-image">
                  <img
                    src={getSkillImage()}
                    alt={skill.name[1] || skill.name[0] || 'Skill'}
                    onError={(e) => {
                      e.target.src = 'https://cdn-icons-png.flaticon.com/512/616/616408.png';
                    }}
                  />
                </div>
              </div>

              <div className="skill-detail-right">
                {!isEditing ? (
                  <>
                    <div className="detail-row">
                      <label>ID:</label>
                      <span>{skill.id}</span>
                    </div>
                    <div className="detail-row">
                      <label>이름 (영문):</label>
                      <span>{skill.name[0]}</span>
                    </div>
                    <div className="detail-row">
                      <label>이름 (한글):</label>
                      <span>{skill.name[1]}</span>
                    </div>
                    <div className="detail-row">
                      <label>설명 (영문):</label>
                      <span>{skill.description[0]}</span>
                    </div>
                    <div className="detail-row">
                      <label>설명 (한글):</label>
                      <span>{skill.description[1]}</span>
                    </div>

                    <div className="detail-section">
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
                    </div>
                  </>
                ) : (
                  <>
                    <div className="detail-row">
                      <label>ID:</label>
                      <input type="text" value={editData.id} disabled />
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
                            description: [
                              e.target.value,
                              editData.description[1],
                            ],
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
                            description: [
                              editData.description[0],
                              e.target.value,
                            ],
                          })
                        }
                      />
                    </div>

                    <div className="detail-section">
                      <div className="button-group">
                        <button className="save-button" onClick={handleSave}>
                          저장
                        </button>
                        <button
                          className="cancel-button"
                          onClick={() => {
                            setIsEditing(false);
                            setEditData(skill);
                          }}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              className="back-button bottom-left"
              onClick={() => navigate('/admin/skills')}
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

export default AdminSkillDetail;
