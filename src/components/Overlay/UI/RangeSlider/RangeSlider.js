import React from 'react';

import './RangeSlider.scss';

const RangeSlider = ({value, maxVal, setValue}) => (
  <input
    step={0.01}
    className="range-slider"
    type="range"
    min={0}
    max={maxVal}
    value={value}
    onChange={(e) => setValue(e.target.value)}
    style={{backgroundSize: `${(value / maxVal) * 100}% 100%`}}
  />
);

export default RangeSlider;
