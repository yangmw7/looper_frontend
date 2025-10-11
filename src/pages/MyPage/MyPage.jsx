import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProfileTab from "./ProfileTab";
import StatsTab from "./StatsTab";
import InventoryTab from "./InventoryTab";
import ActivityTab from "./ActivityTab";
import SettingsTab from "./SettingsTab";
import "./MyPage.css";

function MyPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("profile");
  const [myPageData, setMyPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/profile")) setActiveTab("profile");
    else if (path.includes("/stats")) setActiveTab("stats");
    else if (path.includes("/inventory")) setActiveTab("inventory");
    else if (path.includes("/activity")) setActiveTab("activity");
    else if (path.includes("/settings")) setActiveTab("settings");
  }, [location]);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/mypage/${tab}`);
  };

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
      case "stats":
        return <StatsTab data={myPageData.stats} />;
      case "inventory":
        return <InventoryTab data={myPageData.stats} />;
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

  return (
    <>
      <Header />
      <div className="mypage-background">
        <div className="mypage-wrapper">
          {/* 왼쪽 사이드바 네비게이션 */}
          <aside className="mypage-sidebar">
            <h2 className="sidebar-title">계정 관리</h2>

            <nav className="sidebar-nav">
              <button
                className={`nav-item ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => handleTabChange("profile")}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-text">프로필 정보</span>
              </button>

              <button
                className={`nav-item ${activeTab === "stats" ? "active" : ""}`}
                onClick={() => handleTabChange("stats")}
              >
                <span className="nav-icon">⚔️</span>
                <span className="nav-text">게임 스탯</span>
              </button>

              <button
                className={`nav-item ${
                  activeTab === "inventory" ? "active" : ""
                }`}
                onClick={() => handleTabChange("inventory")}
              >
                <span className="nav-icon">🎒</span>
                <span className="nav-text">인벤토리</span>
              </button>

              <button
                className={`nav-item ${
                  activeTab === "activity" ? "active" : ""
                }`}
                onClick={() => handleTabChange("activity")}
              >
                <span className="nav-icon">📝</span>
                <span className="nav-text">활동 내역</span>
              </button>

              <button
                className={`nav-item ${
                  activeTab === "settings" ? "active" : ""
                }`}
                onClick={() => handleTabChange("settings")}
              >
                <span className="nav-icon">⚙️</span>
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