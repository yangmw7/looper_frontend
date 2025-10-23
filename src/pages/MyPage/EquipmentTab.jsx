import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./EquipmentTab.css";
import warriorSilhouette from "../../assets/warrior-silhouette.png";
import { FaUser, FaChartBar } from "react-icons/fa";
import { GiBackpack } from "react-icons/gi";

function EquipmentTab() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  
  const [equipped, setEquipped] = useState({
    helmet: null,
    armor: null,
    pants: null,
    mainWeapon: null,
    subWeapon: null,
  });

  const [inventory, setInventory] = useState([]);
  const [playerStats, setPlayerStats] = useState({
    hp: 0,
    atk: 0,
    def: 0,
    cri: 0,
    crid: 0,
    spd: 0,
    jmp: 0,
    ats: 0,
    jcnt: 0,
    equipmentHp: 0,
    equipmentAtk: 0,
    equipmentDef: 0,
    equipmentCri: 0,
    equipmentCrid: 0,
    equipmentSpd: 0,
    equipmentJmp: 0,
    equipmentAts: 0,
    equipmentJcnt: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ 
    top: 0, 
    left: 0, 
    position: 'below-center'
  });
  const [tooltipContext, setTooltipContext] = useState('inventory'); // 'inventory' or 'equipment'
  
  const inventoryGridRef = useRef(null);
  const equipmentContainerRef = useRef(null);

  useEffect(() => {
    fetchEquipmentData();
  }, []);

  const fetchEquipmentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      if (!token) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/mypage/equipment`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = response.data;
      
      setPlayerStats(data.stats || {
        hp: 0, atk: 0, def: 0, cri: 0, crid: 0, 
        spd: 0, jmp: 0, ats: 0, jcnt: 0,
        equipmentHp: 0, equipmentAtk: 0, equipmentDef: 0,
        equipmentCri: 0, equipmentCrid: 0, equipmentSpd: 0,
        equipmentJmp: 0, equipmentAts: 0, equipmentJcnt: 0
      });
      
      const equippedData = data.equipped || {};
      setEquipped({
        helmet: equippedData.helmet || null,
        armor: equippedData.armor || null,
        pants: equippedData.pants || null,
        mainWeapon: equippedData.mainWeapon || null,
        subWeapon: equippedData.subWeapon || null,
      });
      
      setInventory(data.inventory || []);
      
      setLoading(false);
    } catch (err) {
      console.error('장비 정보 로드 실패:', err);
      setError('장비 정보를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleEquip = async (item) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }
      
      const currentItem = equipped[item.type];
      if (currentItem?.id === item.id) {
        await handleUnequip(item.type);
        return;
      }
      
      await axios.post(`${API_BASE_URL}/api/mypage/equipment/equip`, {
        itemId: item.id,
        slot: item.type
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      await fetchEquipmentData();
      
    } catch (err) {
      console.error('장비 장착 실패:', err);
      alert('장비 장착에 실패했습니다.');
    }
  };

  const handleUnequip = async (slotKey) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }
      
      await axios.post(`${API_BASE_URL}/api/mypage/equipment/unequip`, {
        slot: slotKey
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      await fetchEquipmentData();
      
    } catch (err) {
      console.error('장비 해제 실패:', err);
      alert('장비 해제에 실패했습니다.');
    }
  };

  const handleMouseEnter = (item, event, context = 'inventory') => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    
    setTooltipContext(context);
    
    if (context === 'inventory') {
      const container = inventoryGridRef.current;
      
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop;
        
        const relativeTop = rect.top - containerRect.top + scrollTop;
        const relativeLeft = rect.left - containerRect.left;
        
        const tooltipWidth = 220;
        const tooltipHeight = 150;
        
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
    } else {
      // 장비창 슬롯용 툴팁 위치 계산
      const container = equipmentContainerRef.current;
      
      if (container) {
        const containerRect = container.getBoundingClientRect();
        
        const relativeTop = rect.top - containerRect.top;
        const relativeLeft = rect.left - containerRect.left;
        
        const tooltipWidth = 220;
        const tooltipHeight = 150;
        
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        const spaceBelow = containerHeight - relativeTop - rect.height;
        const spaceAbove = relativeTop;
        const spaceRight = containerWidth - relativeLeft - rect.width;
        const spaceLeft = relativeLeft;
        
        let position = 'below-center';
        let top = relativeTop + rect.height + 10;
        let left = relativeLeft + rect.width / 2;
        
        if (spaceBelow >= tooltipHeight) {
          position = 'below-center';
          top = relativeTop + rect.height + 10;
          left = relativeLeft + rect.width / 2;
        } else if (spaceAbove >= tooltipHeight) {
          position = 'above-center';
          top = relativeTop - 10;
          left = relativeLeft + rect.width / 2;
        } else if (spaceRight >= tooltipWidth + 20) {
          position = 'right-center';
          top = relativeTop + rect.height / 2;
          left = relativeLeft + rect.width + 10;
        } else if (spaceLeft >= tooltipWidth + 20) {
          position = 'left-center';
          top = relativeTop + rect.height / 2;
          left = relativeLeft - 10;
        }
        
        setHoveredItem(item);
        setTooltipPosition({ top, left, position });
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    setTooltipContext('inventory');
  };

  const Slot = ({ slotKey, label }) => {
    const item = equipped[slotKey];
    
    return (
      <div
        className={`equip-slot ${slotKey}`}
        onDoubleClick={() => item && handleUnequip(slotKey)}
        onMouseEnter={(e) => item && handleMouseEnter(item, e, 'equipment')}
        onMouseLeave={handleMouseLeave}
      >
        <div className="slot-label">{label}</div>
        {item ? (
          item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="slot-icon-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : (
            <div className="slot-icon">{item.icon}</div>
          )
        ) : (
          <div className="slot-empty">비어 있음</div>
        )}
        {item?.imageUrl && (
          <div className="slot-icon" style={{ display: 'none' }}>{item.icon}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="equipment-ui">
        <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>
          로딩 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="equipment-ui">
        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          {error}
          <br />
          <button onClick={fetchEquipmentData} style={{ marginTop: '20px' }}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="equipment-ui">
      <section className="left-panel">
        <div className="character-panel">
          <h2><FaUser style={{ marginRight: '8px' }} />장비창</h2>
          <div className="character-container" ref={equipmentContainerRef}>
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
            
            {/* 장비창용 툴팁 */}
            {hoveredItem && tooltipContext === 'equipment' && (
              <div
                className={`item-tooltip equipment-tooltip tooltip-${tooltipPosition.position}`}
                style={{
                  top: `${tooltipPosition.top}px`,
                  left: `${tooltipPosition.left}px`,
                }}
              >
                <div className="tooltip-name">{hoveredItem.name}</div>
                <div className="tooltip-desc">{hoveredItem.desc}</div>
                <div className="tooltip-stats">
                  {hoveredItem.hp && hoveredItem.hp !== 0 && (
                    <div className="stat-hp">HP {hoveredItem.hp > 0 ? '+' : ''}{hoveredItem.hp}</div>
                  )}
                  {hoveredItem.atk && hoveredItem.atk !== 0 && (
                    <div className="stat-atk">ATK {hoveredItem.atk > 0 ? '+' : ''}{hoveredItem.atk}</div>
                  )}
                  {hoveredItem.def && hoveredItem.def !== 0 && (
                    <div className="stat-def">DEF {hoveredItem.def > 0 ? '+' : ''}{hoveredItem.def}</div>
                  )}
                  {hoveredItem.cri && hoveredItem.cri !== 0 && (
                    <div className="stat-cri">CRI {hoveredItem.cri > 0 ? '+' : ''}{hoveredItem.cri}%</div>
                  )}
                  {hoveredItem.crid && hoveredItem.crid !== 0 && (
                    <div className="stat-crid">CRID {hoveredItem.crid > 0 ? '+' : ''}{hoveredItem.crid}x</div>
                  )}
                  {hoveredItem.spd && hoveredItem.spd !== 0 && (
                    <div className="stat-spd">SPD {hoveredItem.spd > 0 ? '+' : ''}{hoveredItem.spd}</div>
                  )}
                  {hoveredItem.jmp && hoveredItem.jmp !== 0 && (
                    <div className="stat-jmp">JMP {hoveredItem.jmp > 0 ? '+' : ''}{hoveredItem.jmp}</div>
                  )}
                  {hoveredItem.ats && hoveredItem.ats !== 0 && (
                    <div className="stat-ats">ATS {hoveredItem.ats > 0 ? '+' : ''}{hoveredItem.ats}</div>
                  )}
                  {hoveredItem.jcnt && hoveredItem.jcnt !== 0 && (
                    <div className="stat-jcnt">JCNT {hoveredItem.jcnt > 0 ? '+' : ''}{hoveredItem.jcnt}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="stats-panel">
          <h2><FaChartBar style={{ marginRight: '8px' }} />스탯</h2>
          <div className="stats-list">
            <div>HP</div>
            <div>
              {playerStats.hp || 0}
              {playerStats.equipmentHp > 0 && (
                <span className="stat-bonus"> (+{playerStats.equipmentHp})</span>
              )}
            </div>
            
            <div>ATK</div>
            <div>
              {playerStats.atk || 0}
              {playerStats.equipmentAtk > 0 && (
                <span className="stat-bonus"> (+{playerStats.equipmentAtk})</span>
              )}
            </div>
            
            <div>DEF</div>
            <div>
              {playerStats.def || 0}
              {playerStats.equipmentDef > 0 && (
                <span className="stat-bonus"> (+{playerStats.equipmentDef})</span>
              )}
            </div>
            
            <div>CRI</div>
            <div>
              {playerStats.cri || 0}%
              {playerStats.equipmentCri > 0 && (
                <span className="stat-bonus"> (+{playerStats.equipmentCri}%)</span>
              )}
            </div>
            
            <div>CRID</div>
            <div>
              {playerStats.crid || 0}x
              {playerStats.equipmentCrid > 0 && (
                <span className="stat-bonus"> (+{playerStats.equipmentCrid}x)</span>
              )}
            </div>
            
            <div>SPD</div>
            <div>
              {playerStats.spd || 0}
              {playerStats.equipmentSpd > 0 && (
                <span className="stat-bonus"> (+{playerStats.equipmentSpd})</span>
              )}
            </div>
            
            <div>JMP</div>
            <div>
              {playerStats.jmp || 0}
              {playerStats.equipmentJmp > 0 && (
                <span className="stat-bonus"> (+{playerStats.equipmentJmp})</span>
              )}
            </div>
            
            <div>ATS</div>
            <div>
              {playerStats.ats || 0}
              {playerStats.equipmentAts > 0 && (
                <span className="stat-bonus"> (+{playerStats.equipmentAts})</span>
              )}
            </div>
            
            <div>JCNT</div>
            <div>
              {playerStats.jcnt || 0}
              {playerStats.equipmentJcnt > 0 && (
                <span className="stat-bonus"> (+{playerStats.equipmentJcnt})</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="right-panel">
        <div className="inventory-header">
          <h2><GiBackpack style={{ marginRight: '8px' }} />인벤토리</h2>
        </div>
        <div className="inventory-grid-wrapper">
          <div className="inventory-grid" ref={inventoryGridRef}>
            {hoveredItem && tooltipContext === 'inventory' && (
              <div
                className={`item-tooltip inventory-tooltip tooltip-${tooltipPosition.position}`}
                style={{
                  top: `${tooltipPosition.top}px`,
                  left: `${tooltipPosition.left}px`,
                }}
              >
                <div className="tooltip-name">{hoveredItem.name}</div>
                <div className="tooltip-desc">{hoveredItem.desc}</div>
                <div className="tooltip-stats">
                  {hoveredItem.hp && hoveredItem.hp !== 0 && (
                    <div className="stat-hp">HP {hoveredItem.hp > 0 ? '+' : ''}{hoveredItem.hp}</div>
                  )}
                  {hoveredItem.atk && hoveredItem.atk !== 0 && (
                    <div className="stat-atk">ATK {hoveredItem.atk > 0 ? '+' : ''}{hoveredItem.atk}</div>
                  )}
                  {hoveredItem.def && hoveredItem.def !== 0 && (
                    <div className="stat-def">DEF {hoveredItem.def > 0 ? '+' : ''}{hoveredItem.def}</div>
                  )}
                  {hoveredItem.cri && hoveredItem.cri !== 0 && (
                    <div className="stat-cri">CRI {hoveredItem.cri > 0 ? '+' : ''}{hoveredItem.cri}%</div>
                  )}
                  {hoveredItem.crid && hoveredItem.crid !== 0 && (
                    <div className="stat-crid">CRID {hoveredItem.crid > 0 ? '+' : ''}{hoveredItem.crid}x</div>
                  )}
                  {hoveredItem.spd && hoveredItem.spd !== 0 && (
                    <div className="stat-spd">SPD {hoveredItem.spd > 0 ? '+' : ''}{hoveredItem.spd}</div>
                  )}
                  {hoveredItem.jmp && hoveredItem.jmp !== 0 && (
                    <div className="stat-jmp">JMP {hoveredItem.jmp > 0 ? '+' : ''}{hoveredItem.jmp}</div>
                  )}
                  {hoveredItem.ats && hoveredItem.ats !== 0 && (
                    <div className="stat-ats">ATS {hoveredItem.ats > 0 ? '+' : ''}{hoveredItem.ats}</div>
                  )}
                  {hoveredItem.jcnt && hoveredItem.jcnt !== 0 && (
                    <div className="stat-jcnt">JCNT {hoveredItem.jcnt > 0 ? '+' : ''}{hoveredItem.jcnt}</div>
                  )}
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
                    onDoubleClick={() => handleEquip(item)}
                    onMouseEnter={(e) => handleMouseEnter(item, e, 'inventory')}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="item-icon-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : (
                      <div className="item-icon">{item.icon}</div>
                    )}
                    {item.imageUrl && (
                      <div className="item-icon" style={{ display: 'none' }}>{item.icon}</div>
                    )}
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