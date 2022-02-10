import React from 'react';

import './ColorPicker.scss';

const ColorPicker = ({color, setColor}) => (
  <div className="color-picker">
    <input
      type="color"
      value={color}
      onChange={(e) => setColor(e.target.value)}
    />
  </div>
);

export default ColorPicker;
