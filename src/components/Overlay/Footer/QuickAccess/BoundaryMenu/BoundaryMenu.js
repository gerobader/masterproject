import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import SmallNumberInput from '../../../UI/SmallNumberInput/SmallNumberInput';
import RangeSlider from '../../../UI/RangeSlider/RangeSlider';
import {setNetworkBoundarySize, setShowBoundary, setBoundaryOpacity} from '../../../../../redux/settings/settings.actions';

import './BoundaryMenu.scss';

const BoundaryMenu = () => {
  const {networkBoundarySize, showBoundary, boundaryOpacity} = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  return (
    <div
      className={`quick-menu boundary${showBoundary ? ' show-settings' : ''}`}
      title="Network Boundary Settings"
    >
      <div className="click-tracker" onClick={() => dispatch(setShowBoundary(!showBoundary))}/>
      <div className="quick-settings">
        <div className="quick-setting">
          <span>Opacity:</span>
          <RangeSlider value={boundaryOpacity} maxVal={1} setValue={(val) => dispatch(setBoundaryOpacity(val))}/>
        </div>
        <div className="quick-setting">
          <span>Size:</span>
          <SmallNumberInput value={networkBoundarySize} setValue={(val) => dispatch(setNetworkBoundarySize(val))}/>
        </div>
      </div>
    </div>
  );
};

export default BoundaryMenu;
