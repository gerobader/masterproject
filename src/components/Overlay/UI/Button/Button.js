import React from 'react';

import './Button.scss';

const Button = ({onClick, text}) => {
  return (
    <button type="button" className="standard-button" onClick={onClick}>{text}</button>
  );
};

export default Button;
