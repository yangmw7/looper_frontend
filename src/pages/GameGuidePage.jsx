// src/pages/GameGuidePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './GameGuidePage.css';
import { 
  FaGamepad, 
  FaUsers, 
  FaCode,
  FaGithub,
  FaBook,
  FaKeyboard,
  FaMouse,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { 
  GiSwordman, 
  GiCrossedSwords, 
  GiTreasureMap,
  GiSpellBook,
  GiLightningBow,
  GiHeartPlus,
  GiShield,
  GiSpiralArrow,
  GiCrown
} from 'react-icons/gi';
import { IoMdArrowForward } from 'react-icons/io';

export default function GameGuidePage() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  const [showContent, setShowContent] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');
  const [items, setItems] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300);
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    try {
      setLoading(true);
      const [itemsRes, npcsRes, skillsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/items`),
        axios.get(`${API_BASE_URL}/api/npcs`),
        axios.get(`${API_BASE_URL}/api/skills`)
      ]);
      
      // Rarity 순서 정의
      const rarityOrder = {
        'LEGENDARY': 1,
        'EPIC': 2,
        'RARE': 3,
        'UNCOMMON': 4,
        'COMMON': 5
      };
      
      // 아이템을 rarity 순으로 정렬
      const sortedItems = itemsRes.data.sort((a, b) => {
        const rarityA = rarityOrder[a.rarity?.toUpperCase()] || 999;
        const rarityB = rarityOrder[b.rarity?.toUpperCase()] || 999;
        return rarityA - rarityB;
      });
      
      setItems(sortedItems);
      setNpcs(npcsRes.data);
      setSkills(skillsRes.data);
    } catch (error) {
      console.error('게임 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    { id: 'intro', label: '프로젝트 소개', icon: GiCrown },
    { id: 'purpose', label: '제작 목적', icon: FaGamepad },
    { id: 'gameplay', label: '플레이 방법', icon: FaKeyboard },
    { id: 'features', label: '개발 특징', icon: FaCode },
    { id: 'items', label: '아이템 정보', icon: GiTreasureMap },
    { id: 'npcs', label: 'NPC 정보', icon: FaUsers },
    { id: 'skills', label: '스킬 정보', icon: GiSpellBook }
  ];

  return (
    <div className="guide-page">
      <div className="grain-overlay" />
      <Header />

      {/* Hero Section */}
      <section className="guide-hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1" />
          <div className="gradient-orb orb-2" />
        </div>

        <div className={`guide-hero-content ${showContent ? 'show' : ''}`}>
          <div className="hero-badge">
            <GiSwordman style={{ marginRight: '6px' }} />
            완벽 가이드
          </div>
          
          <h1 className="guide-hero-title">
            <span className="gradient-text">게임 정보</span>
          </h1>

          <p className="guide-hero-description">
            프로젝트 소개부터 실제 플레이 방법, 모든 게임 요소까지<br />
            완벽하게 정리된 가이드를 확인하세요
          </p>

          <div className="github-links">
            <a 
              href="https://github.com/jorangi/GameInYB" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link"
            >
              <FaGithub size={20} />
              <span>GitHub Repository</span>
              <FaExternalLinkAlt size={14} />
            </a>
            <a 
              href="https://github.com/jorangi/GameInYB#readme" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-link notion-link"
            >
              <FaBook size={20} />
              <span>상세 문서</span>
              <FaExternalLinkAlt size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="guide-nav">
        <div className="guide-nav-container">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                className={`guide-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => scrollToSection(section.id)}
              >
                <IconComponent size={18} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Sections */}
      <div className="guide-content">
        
        {/* 프로젝트 소개 */}
        <section id="intro" className="guide-section">
          <div className="guide-section-header">
            <GiCrown size={32} className="guide-section-icon" />
            <h2>프로젝트 소개</h2>
          </div>
          
          <div className="guide-content-card guide-intro-card">
            <div className="guide-intro-grid">
              <div className="guide-intro-item">
                <GiSwordman size={40} className="guide-intro-icon" />
                <h3>2D 픽셀 로그라이크 RPG</h3>
                <p>
                  매번 다르게 생성되는 던전에서 살아남으며 성장하는 횡스크롤 액션 게임입니다.
                  초보자도 쉽게 접근할 수 있는 직관적인 조작과 깊이 있는 전략성을 동시에 제공합니다.
                </p>
              </div>
              
              <div className="guide-intro-item">
                <GiCrossedSwords size={40} className="guide-intro-icon" />
                <h3>전략적 성장 시스템</h3>
                <p>
                  다양한 아이템과 스킬을 조합하여 자신만의 빌드를 완성하세요.
                  죽어도 다시 시작하는 로그라이크의 재미와 함께 영구 업그레이드로 점진적인 성장을 경험할 수 있습니다.
                </p>
              </div>
              
              <div className="guide-intro-item">
                <GiLightningBow size={40} className="guide-intro-icon" />
                <h3>빠른 템포의 전투</h3>
                <p>
                  박진감 넘치는 액션과 실시간 전투를 통해 긴장감 있는 게임 플레이를 즐기세요.
                  적절한 타이밍의 회피와 공격이 승리의 열쇠입니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 제작 목적 */}
        <section id="purpose" className="guide-section">
          <div className="guide-section-header">
            <FaGamepad size={32} className="guide-section-icon" />
            <h2>제작 목적</h2>
          </div>

          <div className="guide-purpose-grid">
            <div className="guide-content-card guide-purpose-card">
              <div className="guide-purpose-icon-wrapper user">
                <FaUsers size={32} />
              </div>
              <h3>사용자적 측면</h3>
              <ul className="guide-purpose-list">
                <li>
                  <IoMdArrowForward className="guide-list-icon" />
                  <span>다양한 장르의 게임을 즐기는 유저로서, 더 많은 사람들이 2D 픽셀 그래픽 로그라이크 장르에 쉽게 접근하기를 원했습니다.</span>
                </li>
                <li>
                  <IoMdArrowForward className="guide-list-icon" />
                  <span>복잡한 시스템 대신 초보자 친화적 디자인을 적용하여, 처음 로그라이크를 접하는 사람도 부담 없이 즐길 수 있도록 제작했습니다.</span>
                </li>
              </ul>
            </div>

            <div className="guide-content-card guide-purpose-card">
              <div className="guide-purpose-icon-wrapper dev">
                <FaCode size={32} />
              </div>
              <h3>개발적 측면</h3>
              <ul className="guide-purpose-list">
                <li>
                  <IoMdArrowForward className="guide-list-icon" />
                  <span><strong>팀 협업 경험:</strong> 여러 개발자와 함께 작업하며, 공동 개발 과정에서 발생하는 이슈 해결 및 의사소통 능력을 키웠습니다.</span>
                </li>
                <li>
                  <IoMdArrowForward className="guide-list-icon" />
                  <span><strong>실무 감각 습득:</strong> Unity 클라이언트와 백엔드 서버 간의 통신을 직접 구현하여, 실제 온라인 서비스 구조를 경험했습니다.</span>
                </li>
                <li>
                  <IoMdArrowForward className="guide-list-icon" />
                  <span><strong>장르 선택의 의의:</strong> 중·소규모 개발사에서 자주 도전하는 2D 픽셀 그래픽 + 횡스크롤 기반 로그라이크 개발 경험을 쌓는 것을 목표로 했습니다.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 플레이 방법 */}
        <section id="gameplay" className="guide-section">
          <div className="guide-section-header">
            <FaKeyboard size={32} className="guide-section-icon" />
            <h2>플레이 방법</h2>
          </div>

          <div className="guide-gameplay-grid">
            <div className="guide-content-card guide-gameplay-card">
              <div className="guide-gameplay-header">
                <FaKeyboard size={28} />
                <h3>조작 체계</h3>
              </div>
              <div className="guide-controls-grid">
                <div className="guide-control-item">
                  <div className="guide-control-key">WASD</div>
                  <span>이동</span>
                </div>
                <div className="guide-control-item">
                  <div className="guide-control-key">E</div>
                  <span>스킬 사용</span>
                </div>
                <div className="guide-control-item">
                  <div className="guide-control-key">F</div>
                  <span>상호작용</span>
                </div>
                <div className="guide-control-item">
                  <div className="guide-control-key">ESC</div>
                  <span>메뉴</span>
                </div>
                <div className="guide-control-item">
                  <FaMouse size={24} className="guide-mouse-icon" />
                  <span>공격/선택</span>
                </div>
              </div>
            </div>

            <div className="guide-content-card guide-gameplay-card">
              <div className="guide-gameplay-header">
                <GiSpiralArrow size={28} />
                <h3>설계 방향</h3>
              </div>
              <ul className="guide-design-list">
                <li>
                  <GiHeartPlus className="guide-design-icon" />
                  <div>
                    <strong>직관적 조작</strong>
                    <p>복잡한 상호작용을 최소화하고, 직관적이고 단순한 횡스크롤 조작 방식을 채택했습니다.</p>
                  </div>
                </li>
                <li>
                  <GiShield className="guide-design-icon" />
                  <div>
                    <strong>명확한 피드백</strong>
                    <p>사용자의 입력이 어떤 결과로 이어지는지 명확히 전달되도록 설계하여 낮은 진입장벽과 높은 몰입도를 동시에 추구합니다.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 개발 특징 */}
        <section id="features" className="guide-section">
          <div className="guide-section-header">
            <FaCode size={32} className="guide-section-icon" />
            <h2>개발 특징</h2>
          </div>

          <div className="guide-content-card guide-features-card">
            <div className="guide-features-notice">
              <FaBook size={20} />
              <span>기술적 세부사항은 <a href="https://github.com/jorangi/GameInYB#readme" target="_blank" rel="noopener noreferrer">GitHub README</a>에서 더 자세히 확인하실 수 있습니다.</span>
            </div>

            <div className="guide-features-list">
              <div className="guide-feature-item">
                <div className="guide-feature-number">01</div>
                <div className="guide-feature-content">
                  <h4>메모리 관리 최적화</h4>
                  <p>Unity Addressables을 활용하여 유연한 Asset 참조 및 메모리 관리를 구현했습니다.</p>
                </div>
              </div>

              <div className="guide-feature-item">
                <div className="guide-feature-number">02</div>
                <div className="guide-feature-content">
                  <h4>서버 통신</h4>
                  <p>UnityWebRequest 기반 GET/POST API 통신을 구현하여 안정적인 데이터 교환을 실현했습니다.</p>
                </div>
              </div>

              <div className="guide-feature-item">
                <div className="guide-feature-number">03</div>
                <div className="guide-feature-content">
                  <h4>입력 처리 최적화</h4>
                  <p>InputAction을 활용한 이벤트 기반 입력 처리로 오버헤드를 최소화했습니다.</p>
                </div>
              </div>

              <div className="guide-feature-item">
                <div className="guide-feature-number">04</div>
                <div className="guide-feature-content">
                  <h4>UI 구조 설계</h4>
                  <p>옵저버 패턴을 통해 이벤트를 구독/처리하고, OOP 원칙에 맞춘 느슨한 결합을 추구했습니다.</p>
                </div>
              </div>

              <div className="guide-feature-item">
                <div className="guide-feature-number">05</div>
                <div className="guide-feature-content">
                  <h4>스탯 관리 시스템</h4>
                  <p>캐릭터의 스탯 변화를 Modifier + Provider 구조로 설계하여 유연하고 안정적인 값 변화를 보장합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 아이템 정보 */}
        <section id="items" className="guide-section">
          <div className="guide-section-header">
            <GiTreasureMap size={32} className="guide-section-icon" />
            <h2>아이템 정보</h2>
          </div>

          {loading ? (
            <div className="guide-loading-state">
              <div className="guide-spinner" />
              <p>아이템 정보를 불러오는 중...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="guide-items-grid">
              {items.map((item) => {
                const displayName = Array.isArray(item.name)
                  ? item.name.find(n => /[가-힣]/.test(n)) || item.name[0]
                  : item.name;

                const displayDesc = Array.isArray(item.description)
                  ? item.description.find(d => /[가-힣]/.test(d)) || item.description[0]
                  : item.description;

                return (
                  <div key={item.id} className="guide-content-card guide-game-card">
                    <div className="guide-game-image-wrapper">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={displayName} />
                      )}
                      {item.rarity && (
                        <div className={`guide-game-rarity ${item.rarity.toLowerCase()}`}>
                          {item.rarity}
                        </div>
                      )}
                    </div>
                    <div className="guide-game-info">
                      <div className="guide-game-header">
                        <h3>{displayName}</h3>
                        <span className="guide-game-id">ID: {item.id}</span>
                      </div>
                    </div>

                    <button
                      className="guide-expand-btn"
                      onClick={() => toggleItemExpand(`item-${item.id}`)}
                    >
                      {expandedItems[`item-${item.id}`] ? (
                        <>설명 닫기 <FaChevronUp /></>
                      ) : (
                        <>설명 보기 <FaChevronDown /></>
                      )}
                    </button>

                    {expandedItems[`item-${item.id}`] && (
                      <div className="guide-game-details">
                        <p className="guide-game-description">{displayDesc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="guide-empty-state">
              <GiTreasureMap size={48} />
              <p>등록된 아이템이 없습니다</p>
            </div>
          )}
        </section>


        {/* NPC 정보 */}
        <section id="npcs" className="guide-section">
          <div className="guide-section-header">
            <FaUsers size={32} className="guide-section-icon" />
            <h2>NPC 정보</h2>
          </div>

          {loading ? (
            <div className="guide-loading-state">
              <div className="guide-spinner" />
              <p>NPC 정보를 불러오는 중...</p>
            </div>
          ) : npcs.length > 0 ? (
            <div className="guide-items-grid">
              {npcs.map((npc) => {
                const displayName = Array.isArray(npc.name)
                  ? npc.name.find(n => /[가-힣]/.test(n)) || npc.name[0]
                  : npc.name;

                const displayFeatures = Array.isArray(npc.features)
                  ? npc.features.find(f => /[가-힣]/.test(f)) || npc.features[0]
                  : npc.features;

                return (
                  <div key={npc.id} className="guide-content-card guide-game-card guide-npc-card">
                    <div className="guide-game-image-wrapper">
                      {npc.imageUrl && (
                        <img src={npc.imageUrl} alt={displayName} />
                      )}
                    </div>
                    <div className="guide-game-info">
                      <div className="guide-game-header">
                        <h3>{displayName}</h3>
                        <span className="guide-game-id">ID: {npc.id}</span>
                      </div>
                    </div>

                    <button
                      className="guide-expand-btn"
                      onClick={() => toggleItemExpand(`npc-${npc.id}`)}
                    >
                      {expandedItems[`npc-${npc.id}`] ? (
                        <>특징 닫기 <FaChevronUp /></>
                      ) : (
                        <>특징 보기 <FaChevronDown /></>
                      )}
                    </button>

                    {expandedItems[`npc-${npc.id}`] && (
                      <div className="guide-game-details">
                        {displayFeatures && (
                          <div className="guide-detail-content">
                            <strong>특징:</strong>
                            <p>{displayFeatures}</p>
                          </div>
                        )}
                        {npc.role && (
                          <div className="guide-detail-row">
                            <strong>역할:</strong>
                            <span>{npc.role}</span>
                          </div>
                        )}
                        {npc.location && (
                          <div className="guide-detail-row">
                            <strong>위치:</strong>
                            <span>{npc.location}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="guide-empty-state">
              <FaUsers size={48} />
              <p>등록된 NPC가 없습니다</p>
            </div>
          )}
        </section>


        {/* 스킬 정보 */}
        <section id="skills" className="guide-section">
          <div className="guide-section-header">
            <GiSpellBook size={32} className="guide-section-icon" />
            <h2>스킬 정보</h2>
          </div>

          {loading ? (
            <div className="guide-loading-state">
              <div className="guide-spinner" />
              <p>스킬 정보를 불러오는 중...</p>
            </div>
          ) : skills.length > 0 ? (
            <div className="guide-items-grid">
              {skills.map((skill) => {
                const displayName = Array.isArray(skill.name)
                  ? skill.name.find(n => /[가-힣]/.test(n)) || skill.name[0]
                  : skill.name;

                const displayDesc = Array.isArray(skill.description)
                  ? skill.description.find(d => /[가-힣]/.test(d)) || skill.description[0]
                  : skill.description;

                return (
                  <div key={skill.id} className="guide-content-card guide-game-card guide-skill-card">
                    <div className="guide-game-image-wrapper">
                      {skill.imageUrl && (
                        <img src={skill.imageUrl} alt={displayName} />
                      )}
                    </div>
                    <div className="guide-game-info">
                      <div className="guide-game-header">
                        <h3>{displayName}</h3>
                        <span className="guide-game-id">ID: {skill.id}</span>
                      </div>
                      <div className="guide-skill-stats">
                        {skill.cooldown && (
                          <span className="guide-skill-stat">쿨다운: {skill.cooldown}초</span>
                        )}
                        {skill.damage && (
                          <span className="guide-skill-stat">데미지: {skill.damage}</span>
                        )}
                        {skill.manaCost && (
                          <span className="guide-skill-stat">마나: {skill.manaCost}</span>
                        )}
                      </div>
                    </div>

                    <button
                      className="guide-expand-btn"
                      onClick={() => toggleItemExpand(`skill-${skill.id}`)}
                    >
                      {expandedItems[`skill-${skill.id}`] ? (
                        <>설명 닫기 <FaChevronUp /></>
                      ) : (
                        <>설명 보기 <FaChevronDown /></>
                      )}
                    </button>

                    {expandedItems[`skill-${skill.id}`] && (
                      <div className="guide-game-details">
                        <p className="guide-game-description">{displayDesc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="guide-empty-state">
              <GiSpellBook size={48} />
              <p>등록된 스킬이 없습니다</p>
            </div>
          )}
        </section>



      </div>

      <Footer />
    </div>
  );
}