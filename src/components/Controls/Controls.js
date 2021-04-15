import React from 'react';

import './Controls.scss';

const Controls = ({count, setCount}) => (
  <div className="controls">
    <button onClick={() => setCount(count - 0.2)} type="button">Left!</button>
    <button onClick={() => setCount(count + 0.2)} type="button">Right!</button>
  </div>
);

export default Controls;
