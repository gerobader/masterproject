import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import BoundaryMenu from './BoundaryMenu/BoundaryMenu';
import {setShowAxes} from '../../../../redux/settings/settings.actions';

import './QuickAccess.scss';

const QuickAccess = ({showInfoTable}) => {
  const {axes, showAxes} = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const setAxesVisibility = () => {
    axes.setVisibility(!showAxes);
    dispatch(setShowAxes(!showAxes));
  };

  return (
    <div className={`quick-access-wrapper${showInfoTable ? ' move-up' : ''}`}>
      <BoundaryMenu/>
      <div
        className={`quick-menu show-axes${showAxes ? ' active' : ''}`}
        title={showAxes ? 'Hide Axes' : 'Show Axes'}
        onClick={setAxesVisibility}
      />
    </div>
  );
};

export default QuickAccess;
