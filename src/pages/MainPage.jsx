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
    fetchNotices();
    
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  // 공지사항 API 호출
  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/announcements`, {
        params: { page: 0, size: 20 }
      });

      const allNotices = response.data.content;

      // 핀된 공지 (최대 3개)
      const pinnedNotices = allNotices
        .filter(notice => notice.isPinned)
        .slice(0, 3)
        .map(notice => ({
          id: notice.id,
          title: notice.title,
          date: formatNoticeDate(notice.createdAt),
          badge: getCategoryBadge(notice.category),
          isPinned: true,
          category: notice.category
        }));

      // 일반 공지 (최대 2개)
      const regularNotices = allNotices
        .filter(notice => !notice.isPinned)
        .slice(0, 2)
        .map(notice => ({
          id: notice.id,
          title: notice.title,
          date: formatNoticeDate(notice.createdAt),
          badge: getCategoryBadge(notice.category),
          isPinned: false,
          category: notice.category
        }));

      setNotices([...pinnedNotices, ...regularNotices]);
    } catch (err) {
      console.error('공지사항 로딩 실패:', err);
      setNotices([]);
    }
  };

  const formatNoticeDate = (isoString) => {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  };

  const getCategoryBadge = (category) => {
    const badges = {
      NOTICE: '공지',
      EVENT: '이벤트',
      UPDATE: '업데이트',
      MAINTENANCE: '점검'
    };
    return badges[category] || '공지';
  };

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
      <section className="main-hero-section">
        <div className="main-hero-background">
          <div className="gradient-orb orb-1" />
          <div className="gradient-orb orb-2" />
          <div className="gradient-orb orb-3" />
        </div>

        <div className={`main-hero-content ${showContent ? 'show' : ''}`}>
          <div className="main-hero-badge">
            <FaGamepad style={{ marginRight: '6px' }} />
            2D 로그라이크 RPG
          </div>
          
          <h1 className="main-hero-title">
            <span className="main-title-line">끝없는 던전에서</span>
            <span className="main-title-line main-gradient-text">살아남아라</span>
          </h1>

          <p className="main-hero-description">
            매번 새롭게 생성되는 던전, 전략적인 전투, 그리고 끝없는 성장.<br />
            진정한 로그라이크 어드벤처를 경험하세요.
          </p>

          <div className="main-hero-buttons">
            <button className="main-btn-primary" onClick={() => window.open('https://github.com/jorangi/GameInYB', '_blank')}>
              <span>지금 다운로드</span>
              <FaChevronRight />
            </button>
            <button className="main-btn-secondary" onClick={() => navigate('/guide')}>
              게임 정보
            </button>
          </div>

          <div className="main-hero-stats">
            <div className="main-stat-item">
              <div className="main-stat-number">{stats.players.toLocaleString()}+</div>
              <div className="main-stat-label">플레이어</div>
            </div>
            <div className="main-stat-divider" />
            <div className="main-stat-item">
              <div className="main-stat-number">{stats.items}+</div>
              <div className="main-stat-label">아이템</div>
            </div>
            <div className="main-stat-divider" />
            <div className="main-stat-item">
              <div className="main-stat-number">{stats.dungeons}+</div>
              <div className="main-stat-label">던전</div>
            </div>
          </div>
        </div>

        <div className="main-scroll-indicator">
          <span>SCROLL</span>
          <div className="main-scroll-line" />
        </div>
      </section>

      {/* Game Features Grid */}
      <section className="main-game-features-section">
        <div className="main-features-grid-compact">
          {gameFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="main-feature-compact">
                <div className="main-feature-compact-icon">
                  <IconComponent size={32} />
                </div>
                <div className="main-feature-compact-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Community & Notice Section */}
      <section className="main-content-section">
        <div className="main-content-grid">
          {/* 공지사항 */}
          <div className="main-content-card main-notice-card">
            <div className="main-card-header">
              <h3>
                <FaBullhorn style={{ marginRight: '8px' }} />
                공지사항
              </h3>
              <button className="main-more-btn" onClick={() => navigate('/announcement')}>
                더보기 <IoMdArrowForward style={{ marginLeft: '4px' }} />
              </button>
            </div>
            <div className="main-notice-list">
              {notices.length > 0 ? (
                notices.map((notice) => (
                  <div key={notice.id} className="main-notice-item" onClick={() => navigate(`/announcement/${notice.id}`)}>
                    <div className="main-notice-content">
                      {notice.isPinned && (
                        <span className="main-pin-icon">⭐</span>
                      )}
                      <span className={`main-notice-badge main-notice-${notice.category.toLowerCase()}`}>
                        {notice.badge}
                      </span>
                      <span className="main-notice-title">{notice.title}</span>
                    </div>
                    <span className="main-notice-date">{notice.date}</span>
                  </div>
                ))
              ) : (
                <div className="main-empty-state">공지사항이 없습니다</div>
              )}
            </div>
          </div>

          {/* 커뮤니티 인기글 */}
          <div className="main-content-card main-community-card">
            <div className="main-card-header">
              <h3>
                <FaFire style={{ marginRight: '8px' }} />
                커뮤니티 HOT
              </h3>
              <button className="main-more-btn" onClick={() => navigate('/community')}>
                더보기 <IoMdArrowForward style={{ marginLeft: '4px' }} />
              </button>
            </div>
            <div className="main-community-list">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <div key={post.id} className="main-community-item" onClick={() => navigate(`/community/${post.id}`)}>
                    <span className="main-community-title">{post.title}</span>
                    <span className="main-community-author">{post.writer}</span>
                    <span className="main-community-date">{new Date(post.createdAt).toISOString().split('T')[0]}</span>
                  </div>
                ))
              ) : (
                <div className="main-empty-state">게시글이 없습니다</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="main-features-section">
        <div className="main-section-header">
          <span className="main-section-label">FEATURES</span>
          <h2 className="main-section-title">게임 특징</h2>
        </div>

        <div className="main-features-grid">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <div 
                key={index}
                className={`main-feature-card ${activeFeature === index ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="main-feature-icon">
                  <FeatureIcon size={48} />
                </div>
                <h3 className="main-feature-title">{feature.title}</h3>
                <p className="main-feature-desc">{feature.desc}</p>
                <div className="main-feature-glow" />
              </div>
            );
          })}
        </div>
      </section>

      {/* Video Section */}
      <section className="main-media-section">
        <div className="main-section-header">
          <span className="main-section-label">GAMEPLAY</span>
          <h2 className="main-section-title">게임 플레이 영상</h2>
        </div>
        
        <div className="main-video-container">
          <div className="main-video-placeholder">
            <div className="main-play-button">
              <FaPlay size={40} color="white" />
            </div>
            <div className="main-video-overlay">
              <h3>게임플레이 트레일러</h3>
              <p>던전의 끝을 향한 여정을 미리 만나보세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="main-cta-section">
        <div className="main-cta-content">
          <h2 className="main-cta-title">지금 바로 모험을 시작하세요</h2>
          <p className="main-cta-description">
            무료로 다운로드하고 던전의 끝을 향해 나아가세요
          </p>
          <button className="main-btn-cta" onClick={() => window.open('https://github.com/jorangi/GameInYB', '_blank')}>
            <span>지금 다운로드</span>
            <div className="main-btn-glow" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}