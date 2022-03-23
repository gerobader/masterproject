import React from 'react';

import './ProgressBar.scss';

const ProgressBar = ({progressInfo}) => {
  if (!progressInfo) return null;
  return (
    <div className="progress-wrapper">
      <div className="progress-bar">
        <div className="progress" style={{width: `${progressInfo.percentage}%`}}/>
      </div>
      <p className="progress-info">{progressInfo.info}</p>
    </div>
  );
};

export default ProgressBar;
