import React, {useState} from 'react';
import {SketchPicker} from 'react-color';

import './Indicator.scss';

const Indicator = ({
  selectedColor, position, id, onMouseDown
}) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  console.log(selectedColor);
  return (
    <div
      className="indicator"
      style={{transform: `translateX(${position}px)`}}
      onMouseDown={(e) => onMouseDown(e, id)}
    >
      <div className="body" style={{background: selectedColor, borderColor: selectedColor}}/>
      {colorPickerOpen && (
        // <div/>
        <SketchPicker
          color={selectedColor}
          onChange={(color) => console.log(color)}
          onChangeComplete={(color) => setSelectedColor(color.hex)}
        />
      )}
    </div>
  );
};

export default Indicator;
