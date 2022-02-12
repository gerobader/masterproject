import React, {useState, useEffect} from 'react';

import './Select.scss';

const Select = ({
  options, value, setSelected, className, opensUp, parentOpenState
}) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!parentOpenState) {
      setOpen(false);
    }
  }, [parentOpenState]);
  return (
    <div
      className={`vis-select${open ? ' open' : ''} ${className || ''}${opensUp ? ' opens-up' : ''}`}
      onClick={() => setOpen(!open)}
    >
      <span>{value}</span>
      <div className={`arrow${open ? ' open' : ''}`}/>
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
