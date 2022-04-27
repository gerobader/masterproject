import React from 'react';
import Loader from '../../UI/Loader/Loader';

import './ProgressBar.scss';

const ProgressBar = ({progressInfo}) => {
  if (!progressInfo) return null;
  let isMinutes = false;
  let remainingTime = Math.ceil(progressInfo.remainingTime / 1000);
  if (remainingTime > 60) {
    isMinutes = true;
    remainingTime = Math.ceil(remainingTime / 60);
  }
  return (
    <div className="progress-wrapper">
      <div className="hover-info">{progressInfo.info}</div>
      <div className="progress-bar">
        <div className="progress" style={{width: `${progressInfo.percentage}%`}}/>
      </div>
      <Loader/>
      <p className="progress-info">{`${remainingTime}${isMinutes ? 'm' : 's'} remaining`}</p>
    </div>
  );
};

export default ProgressBar;
