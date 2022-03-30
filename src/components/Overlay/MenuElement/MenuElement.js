import React, {useState} from 'react';

import './MenuElement.scss';
import menuIcon from '../../../assets/menu-icon.svg';

const MenuElement = ({
  children, headline, icon, simpleHeader
}) => {
  const [minimized, setMinimized] = useState(false);
  return (
    <div className={`menu-element${minimized ? ' minimized' : ''}`}>
      <div className="header">
        {!simpleHeader && (
          <img onClick={() => setMinimized(!minimized)} alt="menu-button" className="menu-button" src={menuIcon}/>
        )}
        <h2>{headline}</h2>
        {!simpleHeader && (
          <div className="type-icon-wrapper">
            <img alt={`${headline}-icon`} className="type-icon" src={icon}/>
          </div>
        )}
      </div>
      <div className="controls-wrapper">
        {children}
      </div>
    </div>
  );
};

export default MenuElement;
