import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProfileTab from "./ProfileTab";
import ActivityTab from "./ActivityTab";
import SettingsTab from "./SettingsTab";
import EquipmentTab from "./EquipmentTab";
import "./MyPage.css";

import { FaUser, FaCog, FaClipboardList } from "react-icons/fa";
import { GiCrossedSwords } from "react-icons/gi";

function MyPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("profile");
  const [myPageData, setMyPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 최초 로그인 상태 확인 및 데이터 로드
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/auth");
      return;
    }

    loadMyPageData();
  }, []);

  // 🔹 경로에 따라 탭 자동 활성화
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/profile")) setActiveTab("profile");
    else if (path.includes("/equipment")) setActiveTab("equipment");
    else if (path.includes("/activity")) setActiveTab("activity");
    else if (path.includes("/settings")) setActiveTab("settings");
  }, [location]);

  // 🔹 마이페이지 정보 로드
  const loadMyPageData = () => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    setLoading(true);
    axios
      .get(`${API_BASE_URL}/api/mypage`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setMyPageData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("마이페이지 로드 실패:", err);
        setError(err);
        setLoading(false);
        if (err.response?.status === 401) {
          alert("로그인이 만료되었습니다.");
          navigate("/auth");
        }
      });
  };

  // 🔹 탭 전환
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/mypage/${tab}`);
  };

  // 🔹 탭 내용 렌더링
  const renderTabContent = () => {
    if (loading) return <p className="loading">로딩 중...</p>;
    if (error)
      return <p className="error-message">데이터를 불러올 수 없습니다.</p>;
    if (!myPageData) return null;

    switch (activeTab) {
      case "profile":
        return (
          <ProfileTab data={myPageData.profile} onUpdate={loadMyPageData} />
        );

      case "equipment":
        return <EquipmentTab data={myPageData} />;

      case "activity":
        return <ActivityTab />;

      case "settings":
        return <SettingsTab />;

      default:
        return (
          <ProfileTab data={myPageData.profile} onUpdate={loadMyPageData} />
        );
    }
  };

  // 🔹 최종 UI
  return (
    <>
      <Header />
      <div className="mypage-background">
        <div className="gradient-orb-right" />
        <div className="mypage-wrapper">
          {/* 왼쪽 사이드바 */}
          <aside className="mypage-sidebar">
            <h2 className="sidebar-title">계정 관리</h2>

            <nav className="sidebar-nav">
              {/* 프로필 정보 */}
              <button
                className={`nav-item ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => handleTabChange("profile")}
              >
                <FaUser className="nav-icon" />
                <span className="nav-text">프로필 정보</span>
              </button>

              {/* 장비 관리 (통합 탭) */}
              <button
                className={`nav-item ${
                  activeTab === "equipment" ? "active" : ""
                }`}
                onClick={() => handleTabChange("equipment")}
              >
                <GiCrossedSwords className="nav-icon" />
                <span className="nav-text">장비 관리</span>
              </button>

              {/* 활동 내역 */}
              <button
                className={`nav-item ${
                  activeTab === "activity" ? "active" : ""
                }`}
                onClick={() => handleTabChange("activity")}
              >
                <FaClipboardList className="nav-icon" />
                <span className="nav-text">활동 내역</span>
              </button>

              {/* 설정 */}
              <button
                className={`nav-item ${
                  activeTab === "settings" ? "active" : ""
                }`}
                onClick={() => handleTabChange("settings")}
              >
                <FaCog className="nav-icon" />
                <span className="nav-text">설정</span>
              </button>
            </nav>
          </aside>

          {/* 오른쪽 컨텐츠 영역 */}
          <main className="mypage-content">{renderTabContent()}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MyPage;
