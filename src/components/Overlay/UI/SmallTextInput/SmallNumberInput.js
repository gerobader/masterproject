import React from 'react';

import './SmallNumberInput.scss';

const SmallNumberInput = ({value, setValue}) => (
  <div className="small-number-input-wrapper">
    <input
      type="number"
      className={`small-number-input${value >= 100 ? ' small' : ''}`}
      value={value || ''}
      onChange={(e) => setValue(e.target.value)}
    />
    {value === undefined ? <div className="disabled"/> : ''}
  </div>
);

export default SmallNumberInput;
