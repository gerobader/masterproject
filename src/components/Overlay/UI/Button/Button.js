import React from 'react';

import './Button.scss';

const Button = ({
  onClick, text, className, disabled
}) => (
  <button type="button" className={`standard-button ${className || ''}${disabled ? ' disabled' : ''}`} onClick={onClick}>
    {text}
  </button>
);

export default Button;
