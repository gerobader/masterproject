import React from 'react';

import './Button.scss';

const Button = ({onClick, text, className}) => (
  <button type="button" className={`standard-button ${className || ''}`} onClick={onClick}>{text}</button>
);

export default Button;
