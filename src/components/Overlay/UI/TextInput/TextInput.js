import React from 'react';

import './TextInput.scss';

const TextInput = ({value, setValue, placeholder}) => (
  <input
    className="vis-text-input"
    type="text"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder={placeholder}
  />
);

export default TextInput;
