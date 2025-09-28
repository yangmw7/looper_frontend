import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './MainPage.css';

export default function MainPage() {
  const lines = [
    '끝없는 던전에서 살아남아라!',
    '매번 새롭게 시작되는 로그라이크 어드벤처',
    '2D 액션 + 아이템 파밍의 재미, 지금 경험해보세요'
  ];

  const [showLines, setShowLines] = useState([false, false, false]);
  const [showButtonAndText, setShowButtonAndText] = useState(false);

  useEffect(() => {
    const timers = [];
    timers.push(setTimeout(() => setShowLines([true, false, false]), 0));
    timers.push(setTimeout(() => setShowLines([true, true, false]), 600));
    timers.push(setTimeout(() => setShowLines([true, true, true]), 1200));
    timers.push(setTimeout(() => setShowButtonAndText(true), 2000));
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div className="main-page">
      <div className="overlay" />
      <Header />

      <main className="hero">
        <div className="hero-text">
          <p className={`typing-line ${showLines[0] ? 'fade-in glitch' : ''}`}>{lines[0]}</p>
          <p className={`typing-line ${showLines[1] ? 'fade-in glitch' : ''}`}>{lines[1]}</p>
          <p className={`typing-line ${showLines[2] ? 'fade-in glitch' : ''}`}>{lines[2]}</p>
        </div>

        <button className={`download-button ${showButtonAndText ? 'fade-in' : ''}`}>
          무료 다운로드
        </button>
        <p className={`sub-text ${showButtonAndText ? 'fade-in' : ''}`}>
          2D 로그라이크 게임 · 무료 플레이
        </p>

        <div className="scroll-down">
          <span></span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
