import React, {useState, useEffect} from 'react';

import './Select.scss';

const Select = ({
  options, value, setSelected, className, opensUp, parentOpenState, defaultOption
}) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!parentOpenState) {
      setOpen(false);
    }
  }, [parentOpenState]);
  return (
    <div
      className={`vis-select${open ? ' open' : ''} ${className || ''}${opensUp ? ' opens-up' : ''}${value ? ' has-value' : ''}`}
      onClick={() => setOpen(!open)}
    >
      <span>{value || defaultOption}</span>
      <div className="select-arrow"/>
      {open && (
        <div className="options-wrapper">
          {options.map((option) => (
            <div
              key={option}
              className={`option${value === option ? ' selected' : ''}`}
              onClick={() => setSelected(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
