import React from 'react';

import './Checkbox.scss';

const Checkbox = ({
  name, text, checked, setChecked
}) => {
  return (
    <div className="checkbox-wrapper">
      <label htmlFor={name}>{text}</label>
      <input id={name} type="checkbox" checked={checked} onChange={() => setChecked(!checked)}/>
    </div>
  );
};

export default Checkbox;
