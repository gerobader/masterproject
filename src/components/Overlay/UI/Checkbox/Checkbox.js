import React from 'react';

import './Checkbox.scss';

const Checkbox = ({
  name, text, checked, setChecked, small, className, title
}) => (
  <div
    className={`checkbox-wrapper${small ? ' small' : ''}${className ? ` ${className}` : ''}`}
    title={title}
  >
    {text && <label htmlFor={name}>{text}</label>}
    <input id={name} type="checkbox" checked={checked} onChange={() => setChecked(!checked)}/>
  </div>
);

export default Checkbox;
