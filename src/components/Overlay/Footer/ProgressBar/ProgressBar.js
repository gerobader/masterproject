import React from 'react';
import Loader from '../../UI/Loader/Loader';

import './ProgressBar.scss';

const ProgressBar = ({progressInfo}) => {
  if (!progressInfo) return null;
  const {
    info, percentage, step, type, remainingTime
  } = progressInfo;
  let timeInfo;
  if (remainingTime) {
    let isMinutes = false;
    let time = Math.ceil(remainingTime / 1000);
    if (time > 60) {
      isMinutes = true;
      time = Math.ceil(time / 60);
    }
    timeInfo = <p className="progress-info">{`${time}${isMinutes ? 'm' : 's'} remaining`}</p>;
  }
  return (
    <div className="progress-wrapper">
      {info && <div className="hover-info">{info}</div>}
      {percentage && (
        <div className="progress-bar">
          <div className="progress" style={{width: `${percentage}%`}}/>
        </div>
      )}
      <Loader/>
      <p className="progress-info">{`(${step}/2)`}</p>
      <p className="progress-info border-right">{type}</p>
      {timeInfo}
    </div>
  );
};

export default ProgressBar;
