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
  let displayName = titleCaseOptions ? titleCase(selectedValue) : selectedValue;
  if (selectedValue === 'lcc') displayName = 'LCC';
  return (
    <div
      className={`vis-select${open ? ' open' : ''} ${className || ''}${opensUp ? ' opens-up' : ''}${value ? ' has-value' : ''}`}
      onClick={() => setOpen(!open)}
    >
      <span className="selected-value">{displayName}</span>
      <div className={`select-arrow${alwaysShowArrow ? ' always-visible' : ''}`}/>
      {open && (
        <div className="options-wrapper">
          {options.map((option) => {
            let optionDisplayName = titleCaseOptions ? titleCase(option) : option;
            if (option === 'lcc') optionDisplayName = 'LCC';
            return (
              <div
                key={option}
                className={`option${value === option ? ' selected' : ''}`}
                onClick={() => { if (option !== value) setSelected(option); }}
              >
                {optionDisplayName}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Select;
