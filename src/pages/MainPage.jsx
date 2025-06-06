import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './MainPage.css';

export default function MainPage() {
  // 1) 히어로 텍스트 3줄을 배열에 담아둡니다.
  const lines = [
    '끝없는 던전에서 살아남아라!',
    '매번 새롭게 시작되는 로그라이크 어드벤처',
    '2D 액션 + 아이템 파밍의 재미, 지금 경험해보세요'
  ];

  // 2) fade-in 여부를 관리하는 상태들
  //    - showLines[i]: i번째 줄을 fade-in 했는지 여부
  //    - showButtonAndText: 버튼과 서브텍스트를 동시에 fade-in할지 여부
  const [showLines, setShowLines] = useState([false, false, false]);
  const [showButtonAndText, setShowButtonAndText] = useState(false);

  useEffect(() => {
    const timers = [];

    // 1번째 줄 fade-in (즉시)
    timers.push(
      setTimeout(() => {
        setShowLines([true, false, false]);
      }, 0)
    );

    // 2번째 줄 fade-in (0.5초 뒤)
    timers.push(
      setTimeout(() => {
        setShowLines([true, true, false]);
      }, 500)
    );

    // 3번째 줄 fade-in (1초 뒤)
    timers.push(
      setTimeout(() => {
        setShowLines([true, true, true]);
      }, 1000)
    );

    // 3번째 줄이 완전히 올라오고 나서 (1초 뒤 + 여유 0.5초 = 1.5초),
    // 버튼과 서브텍스트를 동시에 fade-in
    timers.push(
      setTimeout(() => {
        setShowButtonAndText(true);
      }, 1500)
    );

    // 언마운트 시 타이머 정리
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div className="main-page">
      <Header />

      <main className="hero">
        <div className="hero-text">
          {/* 
            displayedLines 대신 lines 자체를 바로 렌더링합니다.
            showLines[i]가 true인 순간 .fade-in 클래스가 붙어서 등장.
          */}
          <p className={`typing-line ${showLines[0] ? 'fade-in' : ''}`}>
            {lines[0]}
          </p>
          <p className={`typing-line ${showLines[1] ? 'fade-in' : ''}`}>
            {lines[1]}
          </p>
          <p className={`typing-line ${showLines[2] ? 'fade-in' : ''}`}>
            {lines[2]}
          </p>
        </div>

        {/* showButtonAndText 가 true 되면 버튼과 텍스트 모두 동시에 fade-in */}
        <button
          className={`download-button ${showButtonAndText ? 'fade-in' : ''}`}
        >
          무료 다운로드
        </button>
        <p className={`sub-text ${showButtonAndText ? 'fade-in' : ''}`}>
          2D 로그라이크 게임 · 무료 플레이
        </p>
      </main>

      <Footer />
    </div>
  );
}
