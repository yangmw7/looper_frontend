import React from "react";
import "./StatsTab.css";

function StatsTab({ data }) {
  return (
    <div className="stats-tab">
      <h3>게임 스탯</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span>HP</span>
          <strong>{data?.hp || 0}</strong>
        </div>
        <div className="stat-item">
          <span>ATK</span>
          <strong>{data?.atk || 0}</strong>
        </div>
        <div className="stat-item">
          <span>DEF</span>
          <strong>{data?.def || 0}</strong>
        </div>
        <div className="stat-item">
          <span>CRI</span>
          <strong>{(data?.cri * 100 || 0).toFixed(1)}%</strong>
        </div>
        <div className="stat-item">
          <span>CRID</span>
          <strong>{data?.crid || 0}x</strong>
        </div>
        <div className="stat-item">
          <span>SPD</span>
          <strong>{data?.spd || 0}</strong>
        </div>
        <div className="stat-item">
          <span>JMP</span>
          <strong>{data?.jmp || 0}</strong>
        </div>
      </div>

      <h4>진행도</h4>
      <p>클리어 횟수: {data?.clear || 0}</p>
      <p>현재 위치: Chapter {data?.chapter || 1} - Stage {data?.stage || 1}</p>
    </div>
  );
}

export default StatsTab;