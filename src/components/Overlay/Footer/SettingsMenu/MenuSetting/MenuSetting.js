import React from 'react';

import './MenuSetting.scss';

const MenuSetting = ({menuText, onClick, children}) => (
  <div className="menu-setting" onClick={onClick}>
    <div className="left-wrapper">
      {children}
    </div>
    <span>{menuText}</span>
  </div>
);

export default MenuSetting;
