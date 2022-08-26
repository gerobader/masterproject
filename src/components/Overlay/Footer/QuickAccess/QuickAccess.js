import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import BoundaryMenu from './BoundaryMenu/BoundaryMenu';
import {setShowAxes} from '../../../../redux/settings/settings.actions';

import './QuickAccess.scss';

const QuickAccess = ({showInfoTable}) => {
  const {showAxes} = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  return (
    <div className={`quick-access-wrapper${showInfoTable ? ' move-up' : ''}`}>
      <BoundaryMenu/>
      <div
        className={`quick-menu show-axes${showAxes ? ' active' : ''}`}
        title={showAxes ? 'Hide Axes' : 'Show Axes'}
        onClick={() => dispatch(setShowAxes(!showAxes))}
      />
    </div>
  );
};

export default QuickAccess;
