import React from 'react';

import './Setting.scss';

const Setting = ({name, children}) => (
  <div className="setting">
    <div className="label">{`${name}:`}</div>
    <div className="config">
      {children}
    </div>
  </div>
);

export default Setting;
