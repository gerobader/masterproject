import React from 'react';
import SmallNumberInput from '../SmallTextInput/SmallNumberInput';

import './RangeInput.scss';

const RangeInput = ({range, setRange}) => {
  const updateRange = (value, type) => {
    const newRange = [...range];
    newRange[type] = value;
    setRange(newRange);
  };
  return (
    <div className="range-input">
      <SmallNumberInput value={range[0]} setValue={(val) => updateRange(val, 0)}/>
      <div className="divider"/>
      <SmallNumberInput value={range[1]} setValue={(val) => updateRange(val, 1)}/>
    </div>
  );
};

export default RangeInput;
