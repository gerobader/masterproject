import React from 'react';

import './KeyBinding.scss';

const KeyBinding = ({keys, action}) => (
  <div className="binding">
    <div className="keys">
      {keys.map((key, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="wrapper" key={index}>
          {index > 0 && <span>+</span>}
          <div className={key.class}>{key.code || ''}</div>
        </div>
      ))}
    </div>
    <div className="separator">-</div>
    <div className="action">{action}</div>
  </div>
);

export default KeyBinding;
