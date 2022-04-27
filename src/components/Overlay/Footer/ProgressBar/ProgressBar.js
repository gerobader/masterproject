import React from 'react';
import Loader from '../../UI/Loader/Loader';

import './ProgressBar.scss';

const ProgressBar = ({progressInfo}) => {
  if (!progressInfo) return null;
  return (
    <div className="progress-wrapper">
      <div className="hover-info">{progressInfo.info}</div>
      <div className="progress-bar">
        <div className="progress" style={{width: `${progressInfo.percentage}%`}}/>
      </div>
      <Loader/>
      <p className="progress-info">{`${Math.ceil(progressInfo.remainingTime / 1000)} s remaining`}</p>
    </div>
  );
};

export default ProgressBar;
