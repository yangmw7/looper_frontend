import React, { useState, useMemo, useRef } from "react";
import "./EquipmentTab.css";
import warriorSilhouette from "../../assets/warrior-silhouette.png";
import { FaUser, FaChartBar } from "react-icons/fa";
import { GiBackpack } from "react-icons/gi";

function EquipmentTab() {
  const [equipped, setEquipped] = useState({
    helmet: null,
    armor: null,
    pants: null,
    mainWeapon: null,
    subWeapon: null,
  });

  const [inventory] = useState([
    { id: "h1", type: "helmet", name: "강철 투구", desc: "단단한 강철로 제작된 투구", atk: 0, def: 8, hp: 15, icon: "⛑️" },
    { id: "h2", type: "helmet", name: "가죽 모자", desc: "부드러운 가죽 모자", atk: 0, def: 3, hp: 8, icon: "🎩" },
    { id: "h3", type: "helmet", name: "마법사의 모자", desc: "신비한 힘이 깃든 모자", atk: 2, def: 2, hp: 10, icon: "🧙" },
    { id: "h4", type: "helmet", name: "왕관", desc: "화려한 금빛 왕관", atk: 0, def: 5, hp: 20, icon: "👑" },
    
    { id: "a1", type: "armor", name: "기사의 흉갑", desc: "중장갑 기사용 갑옷", atk: 0, def: 20, hp: 30, icon: "🛡️" },
    { id: "a2", type: "armor", name: "천 갑옷", desc: "가벼운 천 재질의 갑옷", atk: 0, def: 8, hp: 15, icon: "👕" },
    { id: "a3", type: "armor", name: "용의 비늘 갑옷", desc: "전설의 드래곤 비늘로 제작", atk: 5, def: 25, hp: 40, icon: "🐉" },
    { id: "a4", type: "armor", name: "가죽 갑옷", desc: "튼튼한 가죽 갑옷", atk: 0, def: 12, hp: 20, icon: "🧥" },
    
    { id: "p1", type: "pants", name: "사냥꾼의 각반", desc: "민첩성을 높여주는 각반", atk: 0, def: 10, hp: 12, icon: "👖" },
    { id: "p2", type: "pants", name: "가죽 바지", desc: "편안한 가죽 바지", atk: 0, def: 6, hp: 8, icon: "👖" },
    { id: "p3", type: "pants", name: "강철 각반", desc: "무거운 강철 각반", atk: 0, def: 15, hp: 18, icon: "🦿" },
    
    { id: "m1", type: "mainWeapon", name: "롱소드", desc: "긴 검신의 양손검", atk: 18, def: 0, hp: 0, icon: "⚔️" },
    { id: "m2", type: "mainWeapon", name: "단검", desc: "빠른 공격이 가능한 단검", atk: 10, def: 0, hp: 0, icon: "🗡️" },
    { id: "m3", type: "mainWeapon", name: "대검", desc: "엄청난 위력의 대검", atk: 25, def: 0, hp: 0, icon: "⚔️" },
    { id: "m4", type: "mainWeapon", name: "마법 지팡이", desc: "마법 공격력이 강한 지팡이", atk: 15, def: 0, hp: 0, icon: "🪄" },
    { id: "m5", type: "mainWeapon", name: "활", desc: "원거리 공격 무기", atk: 12, def: 0, hp: 0, icon: "🏹" },
    
    { id: "s1", type: "subWeapon", name: "강철 방패", desc: "든든한 강철 방패", atk: 0, def: 18, hp: 10, icon: "🛡️" },
    { id: "s2", type: "subWeapon", name: "나무 방패", desc: "가벼운 나무 방패", atk: 0, def: 8, hp: 5, icon: "🪵" },
    { id: "s3", type: "subWeapon", name: "마법 책", desc: "보조 마법서", atk: 5, def: 5, hp: 0, icon: "📖" },
    { id: "s4", type: "subWeapon", name: "화살통", desc: "화살을 담는 통", atk: 3, def: 2, hp: 0, icon: "🏹" },
    { id: "s5", type: "subWeapon", name: "빛나는 검", desc: "특별한 무기", atk: 8, def: 3, hp: 5, icon: "✨" },
    { id: "s6", type: "subWeapon", name: "활", desc: "활과 화살", atk: 6, def: 1, hp: 0, icon: "🏹" },
  ]);

  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ 
    top: 0, 
    left: 0, 
    position: 'below-center'
  });
  const inventoryGridRef = useRef(null);

  // 기본 스탯
  const baseStats = {
    hp: 100,
    atk: 10,
    def: 5,
    cri: 12.5,
    crid: 1.8,
    spd: 7,
    jmp: 5,
  };

  // 장비로 인한 추가 스탯 계산
  const equipmentStats = useMemo(() => {
    const bonus = { hp: 0, atk: 0, def: 0 };
    
    Object.values(equipped).forEach((item) => {
      if (item) {
        bonus.hp += item.hp || 0;
        bonus.atk += item.atk || 0;
        bonus.def += item.def || 0;
      }
    });
    
    return bonus;
  }, [equipped]);

  // 최종 스탯 계산
  const playerStats = {
    hp: baseStats.hp + equipmentStats.hp,
    atk: baseStats.atk + equipmentStats.atk,
    def: baseStats.def + equipmentStats.def,
    cri: baseStats.cri,
    crid: baseStats.crid,
    spd: baseStats.spd,
    jmp: baseStats.jmp,
  };

  const handleEquip = (item) => {
    setEquipped((prev) => {
      const currentItem = prev[item.type];
      
      if (currentItem?.id === item.id) {
        return {
          ...prev,
          [item.type]: null,
        };
      }
      
      return {
        ...prev,
        [item.type]: item,
      };
    });
  };

  const handleUnequip = (slotKey) => {
    if (equipped[slotKey]) {
      setEquipped((prev) => ({
        ...prev,
        [slotKey]: null,
      }));
    }
  };

  const handleMouseEnter = (item, event) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const container = inventoryGridRef.current;
    
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      
      const relativeTop = rect.top - containerRect.top + scrollTop;
      const relativeLeft = rect.left - containerRect.left;
      
      const tooltipWidth = 220;
      const tooltipHeight = 130;
      
      const containerWidth = container.scrollWidth;
      const containerHeight = container.scrollHeight;
      
      const spaceAbove = relativeTop;
      const spaceBelow = containerHeight - relativeTop - rect.height;
      const spaceLeft = relativeLeft;
      const spaceRight = containerWidth - relativeLeft - rect.width;
      
      let position = 'below-center';
      let top = relativeTop + rect.height + 10;
      let left = relativeLeft + rect.width / 2;
      
      if (spaceBelow >= tooltipHeight) {
        position = 'below-center';
        top = relativeTop + rect.height + 10;
        left = relativeLeft + rect.width / 2;
        
        if (left - tooltipWidth / 2 < 20) {
          position = 'below-left';
          left = relativeLeft;
        } else if (left + tooltipWidth / 2 > containerWidth - 20) {
          position = 'below-right';
          left = relativeLeft + rect.width;
        }
      } else if (spaceAbove >= tooltipHeight) {
        position = 'above-center';
        top = relativeTop - 10;
        left = relativeLeft + rect.width / 2;
        
        if (left - tooltipWidth / 2 < 20) {
          position = 'above-left';
          left = relativeLeft;
        } else if (left + tooltipWidth / 2 > containerWidth - 20) {
          position = 'above-right';
          left = relativeLeft + rect.width;
        }
      } else if (spaceRight >= tooltipWidth) {
        position = 'right-center';
        top = relativeTop + rect.height / 2;
        left = relativeLeft + rect.width + 10;
      } else if (spaceLeft >= tooltipWidth) {
        position = 'left-center';
        top = relativeTop + rect.height / 2;
        left = relativeLeft - 10;
      } else {
        const maxSpace = Math.max(spaceBelow, spaceAbove, spaceLeft, spaceRight);
        
        if (maxSpace === spaceBelow || maxSpace === spaceAbove) {
          position = maxSpace === spaceBelow ? 'below-center' : 'above-center';
          top = maxSpace === spaceBelow ? relativeTop + rect.height + 10 : relativeTop - 10;
          left = relativeLeft + rect.width / 2;
        } else {
          position = maxSpace === spaceRight ? 'right-center' : 'left-center';
          top = relativeTop + rect.height / 2;
          left = maxSpace === spaceRight ? relativeLeft + rect.width + 10 : relativeLeft - 10;
        }
      }
      
      setHoveredItem(item);
      setTooltipPosition({ top, left, position });
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const Slot = ({ slotKey, label }) => {
    const item = equipped[slotKey];
    
    return (
      <div
        className={`equip-slot ${slotKey}`}
        onDoubleClick={() => handleUnequip(slotKey)}
        onMouseEnter={(e) => item && handleMouseEnter(item, e)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="slot-label">{label}</div>
        {item ? (
          <div className="slot-icon">{item.icon}</div>
        ) : (
          <div className="slot-empty">비어 있음</div>
        )}
      </div>
    );
  };

  return (
    <div className="equipment-ui">
      {/* 왼쪽: 장비 + 스탯 */}
      <section className="left-panel">
        <div className="character-panel">
          <h2><FaUser style={{ marginRight: '8px' }} />장비창</h2>
          <div className="character-container">
            <div className="character-figure">
              <img 
                src={warriorSilhouette} 
                alt="전사 실루엣" 
                className="warrior-image"
              />
            </div>

            <Slot slotKey="helmet" label="헬멧" />
            <Slot slotKey="armor" label="갑옷" />
            <Slot slotKey="pants" label="바지" />
            <Slot slotKey="mainWeapon" label="주무기" />
            <Slot slotKey="subWeapon" label="보조무기" />
          </div>
        </div>

        <div className="stats-panel">
          <h2><FaChartBar style={{ marginRight: '8px' }} />스탯</h2>
          <div className="stats-list">
            <div>HP</div>
            <div>
              {playerStats.hp}
              {equipmentStats.hp > 0 && (
                <span className="stat-bonus"> (+{equipmentStats.hp})</span>
              )}
            </div>
            
            <div>ATK</div>
            <div>
              {playerStats.atk}
              {equipmentStats.atk > 0 && (
                <span className="stat-bonus"> (+{equipmentStats.atk})</span>
              )}
            </div>
            
            <div>DEF</div>
            <div>
              {playerStats.def}
              {equipmentStats.def > 0 && (
                <span className="stat-bonus"> (+{equipmentStats.def})</span>
              )}
            </div>
            
            <div>CRI</div><div>{playerStats.cri}%</div>
            <div>CRID</div><div>{playerStats.crid}x</div>
            <div>SPD</div><div>{playerStats.spd}</div>
            <div>JMP</div><div>{playerStats.jmp}</div>
          </div>
        </div>
      </section>

      {/* 오른쪽: 인벤토리 */}
      <section className="right-panel">
        <div className="inventory-header">
          <h2><GiBackpack style={{ marginRight: '8px' }} />인벤토리</h2>
        </div>
        <div className="inventory-grid-wrapper">
          <div className="inventory-grid" ref={inventoryGridRef}>
            {/* 툴팁 - 인벤토리 컨테이너 내부 */}
            {hoveredItem && (
              <div
                className={`item-tooltip tooltip-${tooltipPosition.position}`}
                style={{
                  top: `${tooltipPosition.top}px`,
                  left: `${tooltipPosition.left}px`,
                }}
              >
                <div className="tooltip-name">{hoveredItem.name}</div>
                <div className="tooltip-desc">{hoveredItem.desc}</div>
                <div className="tooltip-stats">
                  {hoveredItem.hp > 0 && <div className="stat-hp">HP +{hoveredItem.hp}</div>}
                  {hoveredItem.atk > 0 && <div className="stat-atk">ATK +{hoveredItem.atk}</div>}
                  {hoveredItem.def > 0 && <div className="stat-def">DEF +{hoveredItem.def}</div>}
                </div>
              </div>
            )}
            
            {inventory.length > 0 ? (
              inventory.map((item) => {
                const isEquipped = equipped[item.type]?.id === item.id;
                
                return (
                  <div
                    key={item.id}
                    className={`inventory-slot ${isEquipped ? "equipped" : ""}`}
                    onClick={() => handleEquip(item)}
                    onMouseEnter={(e) => handleMouseEnter(item, e)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="item-icon">{item.icon}</div>
                    {isEquipped && <div className="equipped-badge">E</div>}
                  </div>
                );
              })
            ) : (
              <p className="empty">보유 아이템이 없습니다.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default EquipmentTab;