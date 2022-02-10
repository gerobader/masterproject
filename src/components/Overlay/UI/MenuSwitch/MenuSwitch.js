import React from 'react';

import './MenuSwitch.scss';

const MenuSwitch = ({setActiveMenu, activeMenu}) => (
  <div className="menu-switch">
    <div onClick={() => setActiveMenu('left')} className={`switch left${activeMenu === 'left' ? ' active' : ''}`}>
      <span>Absolute</span>
    </div>
    <div onClick={() => setActiveMenu('right')} className={`switch right${activeMenu === 'right' ? ' active' : ''}`}>
      <span>Mapping</span>
    </div>
  </div>
);

export default MenuSwitch;
