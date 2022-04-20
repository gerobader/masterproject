import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {setShowLabel} from '../../../../redux/settings/settings.actions';

import './LabelSwitch.scss';

const LabelSwitch = () => {
  const {showLabel} = useSelector((state) => state.settings);
  const {nodes, selectedNodes} = useSelector((state) => state.networkElements);
  const dispatch = useDispatch();
  const getLabel = () => {
    if (showLabel === 0) return 'No Labels';
    if (showLabel === 1) return 'Labels for selected';
    return 'All Labels';
  };

  const updateShowLabelState = () => {
    const newState = (showLabel + 1) % 3;
    if (newState === 0 || newState === 1) nodes.forEach((node) => node.hideLabel(true));
    else nodes.forEach((node) => node.showLabel(true));
    if (newState === 1) {
      selectedNodes.forEach((node) => node.showLabel(true));
    }
    dispatch(setShowLabel(newState));
  };

  return (
    <div className="three-state-switch-wrapper">
      <span className="label">{getLabel()}</span>
      <div className="three-state-switch" onClick={updateShowLabelState}>
        <div className={`state-indicator  state-${showLabel}`}/>
      </div>
    </div>
  );
};

export default LabelSwitch;
