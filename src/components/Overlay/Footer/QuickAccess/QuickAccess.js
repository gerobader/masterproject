import React from 'react';
import BoundaryMenu from './BoundaryMenu/BoundaryMenu';

import './QuickAccess.scss';

const QuickAccess = ({showInfoTable}) => (
  <div className={`quick-access-wrapper${showInfoTable ? ' move-up' : ''}`}>
    <BoundaryMenu/>
  </div>
);

export default QuickAccess;
