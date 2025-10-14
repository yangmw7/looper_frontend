import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AdminUserList from "./User/AdminUserList";
import AdminItemList from "./Item/AdminItemList";
import AdminNpcList from "./Npc/AdminNpcList";
import AdminSkillList from "./Skill/AdminSkillList";
import AdminReportList from "./Report/AdminReportList";
import "./AdminPage.css";

import { FaUsers, FaBoxOpen, FaRobot, FaMagic, FaExclamationTriangle } from "react-icons/fa";

function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("users");

  // 경로에 따라 탭 자동 활성화
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/users")) setActiveTab("users");
    else if (path.includes("/admin/items")) setActiveTab("items");
    else if (path.includes("/admin/npcs")) setActiveTab("npcs");
    else if (path.includes("/admin/skills")) setActiveTab("skills");
    else if (path.includes("/admin/reports")) setActiveTab("reports");
    else if (path.includes("/admin/appeals")) setActiveTab("reports");
  }, [location]);

  // 탭 전환
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  // 탭 내용 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <AdminUserList />;
      case "items":
        return <AdminItemList />;
      case "npcs":
        return <AdminNpcList />;
      case "skills":
        return <AdminSkillList />;
      case "reports":
        return <AdminReportList />;
      default:
        return <AdminUserList />;
    }
  };

  return (
    <>
      <Header />
      <div className="admin-background">
        <div className="admin-gradient-orb-right" />
        <div className="admin-wrapper">
          {/* 왼쪽 사이드바 */}
          <aside className="admin-sidebar">
            <h2 className="sidebar-title">관리자</h2>

            <nav className="sidebar-nav">
              {/* 회원 관리 */}
              <button
                className={`nav-item ${activeTab === "users" ? "active" : ""}`}
                onClick={() => handleTabChange("users")}
              >
                <FaUsers className="nav-icon" />
                <span className="nav-text">회원 관리</span>
              </button>

              {/* 아이템 관리 */}
              <button
                className={`nav-item ${activeTab === "items" ? "active" : ""}`}
                onClick={() => handleTabChange("items")}
              >
                <FaBoxOpen className="nav-icon" />
                <span className="nav-text">아이템 관리</span>
              </button>

              {/* NPC 관리 */}
              <button
                className={`nav-item ${activeTab === "npcs" ? "active" : ""}`}
                onClick={() => handleTabChange("npcs")}
              >
                <FaRobot className="nav-icon" />
                <span className="nav-text">NPC 관리</span>
              </button>

              {/* 스킬 관리 */}
              <button
                className={`nav-item ${activeTab === "skills" ? "active" : ""}`}
                onClick={() => handleTabChange("skills")}
              >
                <FaMagic className="nav-icon" />
                <span className="nav-text">스킬 관리</span>
              </button>

              {/* 신고 & 이의신청 관리 (통합) */}
              <button
                className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
                onClick={() => handleTabChange("reports")}
              >
                <FaExclamationTriangle className="nav-icon" />
                <span className="nav-text">신고 & 이의신청</span>
              </button>
            </nav>
          </aside>

          {/* 오른쪽 컨텐츠 영역 */}
          <main className="admin-content">{renderTabContent()}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AdminPage;