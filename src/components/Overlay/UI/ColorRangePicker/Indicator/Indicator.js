import React from 'react';

import './Indicator.scss';

const Indicator = ({
  color, position, id, onMouseDown, setColor, shouldOpenPicker
}) => {
  const onClickOnColorInput = (e) => {
    if (!shouldOpenPicker) e.preventDefault();
  };
  return (
    <div
      className="indicator"
      style={{transform: `translateX(${position}px)`}}
      onMouseDown={(e) => onMouseDown(e, id)}
    >
      <div className="body" style={{background: color, borderColor: color}}>
        <div className="color-input-wrapper">
          <input onClick={onClickOnColorInput} type="color" value={color} onChange={(e) => setColor(e.target.value, id)}/>
        </div>
      </div>
    </div>
  );
};

export default Indicator;
