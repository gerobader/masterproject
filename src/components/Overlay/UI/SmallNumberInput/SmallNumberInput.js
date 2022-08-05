import React from 'react';

import './SmallNumberInput.scss';

const SmallNumberInput = ({value, setValue, disableHistory}) => {
  const updateValue = (e) => {
    if (disableHistory && (e.nativeEvent.inputType === 'historyUndo' || e.nativeEvent.inputType === 'historyRedo')) return;
    setValue(e.target.value);
  };

  return (
    <div className="small-number-input-wrapper">
      <input
        type="number"
        className={`small-number-input${value >= 99999 ? ' small' : ''}`}
        value={value !== undefined ? value : ''}
        onChange={updateValue}
      />
      {value === undefined ? <div className="disabled"/> : ''}
    </div>
  );
};

export default SmallNumberInput;
