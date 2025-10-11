import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './MainPage.css';
import { 
  FaGamepad, 
  FaChevronRight, 
  FaBullhorn,
  FaFire,
  FaPlay
} from 'react-icons/fa';
import { 
  GiSwordman, 
  GiCrossedSwords, 
  GiTreasureMap,
  GiCrosshair,
  GiLightningBow,
  GiCardPickup,
  GiTrophy,
  GiGiftOfKnowledge,
  GiPartyPopper
} from 'react-icons/gi';
import { IoMdArrowForward } from 'react-icons/io';

export default function MainPage() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const [showContent, setShowContent] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [recentPosts, setRecentPosts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState({
    players: 1247,
    items: 53,
    dungeons: 12
  });

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);

    // 최근 게시글 가져오기
    axios.get(`${API_BASE_URL}/api/posts`)
      .then((response) => {
        const sortedPosts = response.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentPosts(sortedPosts);
      })
      .catch((err) => console.error('게시글 로딩 실패:', err));

    // 공지사항 가져오기
    setNotices([
      { id: 1, title: '신규 던전 "어둠의 심연" 오픈!', date: '2025-10-10', badge: 'NEW', icon: GiPartyPopper },
      { id: 2, title: '대규모 밸런스 패치 노트', date: '2025-10-08', badge: '중요', icon: GiCrossedSwords },
      { id: 3, title: '주간 이벤트: 경험치 2배!', date: '2025-10-05', badge: '이벤트', icon: GiGiftOfKnowledge },
    ]);
    
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  const features = [
    {
      title: '무한 던전 탐험',
      desc: '매번 다르게 생성되는 던전에서 살아남아라',
      icon: GiSwordman
    },
    {
      title: '전략적 전투',
      desc: '다양한 스킬과 아이템을 조합하여 최강의 빌드를 완성하세요',
      icon: GiCrossedSwords
    },
    {
      title: '끝없는 성장',
      desc: '죽어도 다시 시작하는 로그라이크의 재미',
      icon: FaGamepad
    }
  ];

  const gameFeatures = [
    { icon: GiCrosshair, title: '로그라이크', desc: '랜덤 생성 던전' },
    { icon: GiLightningBow, title: '빠른 전투', desc: '박진감 넘치는 액션' },
    { icon: GiCardPickup, title: '아이템 파밍', desc: '수집의 재미' },
    { icon: GiTrophy, title: '랭킹 시스템', desc: '경쟁과 도전' },
  ];

  return (
    <div className="main-page">
      <div className="grain-overlay" />
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="gradient-orb orb-1" />
          <div className="gradient-orb orb-2" />
          <div className="gradient-orb orb-3" />
        </div>

        <div className={`hero-content ${showContent ? 'show' : ''}`}>
          <div className="hero-badge">
            <FaGamepad style={{ marginRight: '6px' }} />
            2D 로그라이크 RPG
          </div>
          
          <h1 className="hero-title">
            <span className="title-line">끝없는 던전에서</span>
            <span className="title-line gradient-text">살아남아라</span>
          </h1>

          <p className="hero-description">
            매번 새롭게 생성되는 던전, 전략적인 전투, 그리고 끝없는 성장.<br />
            진정한 로그라이크 어드벤처를 경험하세요.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/auth')}>
              <span>지금 시작하기</span>
              <FaChevronRight />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/guide')}>
              게임 정보
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{stats.players.toLocaleString()}+</div>
              <div className="stat-label">플레이어</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-number">{stats.items}+</div>
              <div className="stat-label">아이템</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <div className="stat-number">{stats.dungeons}+</div>
              <div className="stat-label">던전</div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* Game Features Grid */}
      <section className="game-features-section">
        <div className="features-grid-compact">
          {gameFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="feature-compact">
                <div className="feature-compact-icon">
                  <IconComponent size={32} />
                </div>
                <div className="feature-compact-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Community & Notice Section */}
      <section className="content-section">
        <div className="content-grid">
          {/* 공지사항 */}
          <div className="content-card notice-card">
            <div className="card-header">
              <h3>
                <FaBullhorn style={{ marginRight: '8px' }} />
                공지사항
              </h3>
              <button className="more-btn" onClick={() => navigate('/notice')}>
                더보기 <IoMdArrowForward style={{ marginLeft: '4px' }} />
              </button>
            </div>
            <div className="notice-list">
              {notices.map((notice) => {
                const NoticeIcon = notice.icon;
                return (
                  <div key={notice.id} className="notice-item" onClick={() => navigate(`/notice/${notice.id}`)}>
                    <div className="notice-content">
                      <span className={`notice-badge ${notice.badge === 'NEW' ? 'new' : notice.badge === '중요' ? 'important' : 'event'}`}>
                        {notice.badge}
                      </span>
                      <NoticeIcon style={{ marginRight: '8px', fontSize: '1.2rem' }} />
                      <span className="notice-title">{notice.title}</span>
                    </div>
                    <span className="notice-date">{notice.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 커뮤니티 인기글 */}
          <div className="content-card community-card">
            <div className="card-header">
              <h3>
                <FaFire style={{ marginRight: '8px' }} />
                커뮤니티 HOT
              </h3>
              <button className="more-btn" onClick={() => navigate('/community')}>
                더보기 <IoMdArrowForward style={{ marginLeft: '4px' }} />
              </button>
            </div>
            <div className="community-list">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div key={post.id} className="community-item" onClick={() => navigate(`/community/${post.id}`)}>
                    <span className="community-title">{post.title}</span>
                    <span className="community-author">{post.writer}</span>
                    <span className="community-date">{new Date(post.createdAt).toISOString().split('T')[0]}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">게시글이 없습니다</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-label">FEATURES</span>
          <h2 className="section-title">게임 특징</h2>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <div 
                key={index}
                className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="feature-icon">
                  <FeatureIcon size={48} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
                <div className="feature-glow" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Video/Screenshots Section */}
      <section className="media-section">
        <div className="section-header">
          <span className="section-label">GAMEPLAY</span>
          <h2 className="section-title">게임 플레이 영상</h2>
        </div>
        
        <div className="video-container">
          <div className="video-placeholder">
            <div className="play-button">
              <FaPlay size={40} color="white" />
            </div>
            <div className="video-overlay">
              <h3>게임플레이 트레일러</h3>
              <p>던전의 끝을 향한 여정을 미리 만나보세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">지금 바로 모험을 시작하세요</h2>
          <p className="cta-description">
            무료로 플레이하고 던전의 끝을 향해 나아가세요
          </p>
          <button className="btn-cta" onClick={() => navigate('/auth')}>
            <span>무료로 시작하기</span>
            <div className="btn-glow" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}