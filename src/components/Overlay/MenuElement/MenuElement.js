import React, {useState} from 'react';

import './MenuElement.scss';
import menuIcon from '../../../assets/menuIcon.svg';
import appearanceIcon from '../../../assets/appearanceIcon.svg';

const MenuElement = ({children, headline}) => {
  const [minimized, setMinimized] = useState(false);
  return (
    <div className={`menu-element${minimized ? ' minimized' : ''}`}>
      <div className="header">
        <img onClick={() => setMinimized(!minimized)} alt="menu-button" className="menu-button" src={menuIcon}/>
        <h2>{headline}</h2>
        <div className="type-icon-wrapper">
          <img alt={`${headline}-icon`} className="type-icon" src={appearanceIcon}/>
        </div>
      </div>
      <div className="controls-wrapper">
        {children}
      </div>
    </div>
  );
};

export default MenuElement;
