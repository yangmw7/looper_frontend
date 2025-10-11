import React from "react";

function InventoryTab({ data }) {
  const equiped = data?.equiped ? JSON.parse(data.equiped) : [];
  const inventory = data?.inventory ? JSON.parse(data.inventory) : [];

  return (
    <div className="inventory-tab">
      <h3>장착 장비</h3>
      <div className="equipped-items">
        {equiped.length > 0 ? (
          equiped.map((item, idx) => <div key={idx}>{item.name}</div>)
        ) : (
          <p>장착된 장비가 없습니다.</p>
        )}
      </div>

      <h3>인벤토리</h3>
      <div className="inventory-items">
        {inventory.length > 0 ? (
          inventory.map((item, idx) => <div key={idx}>{item.name}</div>)
        ) : (
          <p>보유 아이템이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default InventoryTab;