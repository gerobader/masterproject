import React, {useState, useEffect} from 'react';
import {titleCase} from '../../../utility';

import './Select.scss';

const Select = ({
  options, value, setSelected, className, opensUp, parentOpenState, defaultOption, alwaysShowArrow, titleCaseOptions
}) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!parentOpenState) {
      setOpen(false);
    }
  }, [parentOpenState]);
  const selectedValue = value || defaultOption;
  return (
    <div
      className={`vis-select${open ? ' open' : ''} ${className || ''}${opensUp ? ' opens-up' : ''}${value ? ' has-value' : ''}`}
      onClick={() => setOpen(!open)}
    >
      <span className="selected-value">{titleCaseOptions ? titleCase(selectedValue) : selectedValue}</span>
      <div className={`select-arrow${alwaysShowArrow ? ' always-visible' : ''}`}/>
      {open && (
        <div className="options-wrapper">
          {options.map((option) => (
            <div
              key={option}
              className={`option${value === option ? ' selected' : ''}`}
              onClick={() => { if (option !== value) setSelected(option); }}
            >
              {titleCaseOptions ? titleCase(option) : option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
