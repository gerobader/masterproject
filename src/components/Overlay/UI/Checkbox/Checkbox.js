import React from 'react';

import './Checkbox.scss';

const Checkbox = ({
  name, text, checked, setChecked, small
}) => (
  <div className={`checkbox-wrapper${small ? ' small' : ''}`}>
    {text && <label htmlFor={name}>{text}</label>}
    <input id={name} type="checkbox" checked={checked} onChange={() => setChecked(!checked)}/>
  </div>
);

export default Checkbox;
