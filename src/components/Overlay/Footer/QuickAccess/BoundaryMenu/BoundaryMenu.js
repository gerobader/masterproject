import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Box3, Vector3} from 'three';
import SmallNumberInput from '../../../UI/SmallNumberInput/SmallNumberInput';
import RangeSlider from '../../../UI/RangeSlider/RangeSlider';
import Octree from '../../../Controls/Layout/Octree';
import {setNetworkBoundarySize, setShowBoundary, setBoundaryOpacity} from '../../../../../redux/settings/settings.actions';
import {setOctree} from '../../../../../redux/network/network.actions';

import './BoundaryMenu.scss';

const BoundaryMenu = () => {
  const {
    networkBoundarySize, showBoundary, boundaryOpacity, layoutCalculationRunning, axes
  } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  const updateNetworkBoundarySize = (size) => {
    if (layoutCalculationRunning) return;
    const octree = new Octree(
      new Box3(
        new Vector3(-size / 2, -size / 2, -size / 2),
        new Vector3(size / 2, size / 2, size / 2)
      ),
      4
    );
    axes.setPosition(size);
    dispatch(setOctree(octree));
    dispatch(setNetworkBoundarySize(size));
  };

  return (
    <div
      className={`quick-menu boundary${showBoundary ? ' active' : ''}`}
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
          <SmallNumberInput value={networkBoundarySize} setValue={updateNetworkBoundarySize}/>
        </div>
      </div>
    </div>
  );
};

export default BoundaryMenu;
