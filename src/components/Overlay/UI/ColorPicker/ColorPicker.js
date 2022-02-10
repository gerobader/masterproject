import React from 'react';

import './ColorPicker.scss';

const ColorPicker = ({color, setColor}) => (
  <div className="color-picker">
    <input
      type="color"
      value={color || '#000000'}
      onChange={(e) => setColor(e.target.value)}
    />
    {!color ? <div className="disabled"/> : ''}
  </div>
);

export default ColorPicker;
