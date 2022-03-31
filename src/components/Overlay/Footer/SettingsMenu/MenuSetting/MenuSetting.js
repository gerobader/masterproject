import React from 'react';

import './MenuSetting.scss';

const MenuSetting = ({menuText, imgSource, onClick}) => (
  <div className="menu-setting" onClick={onClick}>
    <div className="icon-wrapper">
      {imgSource && <img alt={`${menuText}-icon`} src={imgSource}/>}
    </div>
    <span>{menuText}</span>
  </div>
);

export default MenuSetting;
