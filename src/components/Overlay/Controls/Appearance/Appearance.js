import React from 'react';
import {useSelector} from 'react-redux';

import './Appearance.scss';

const Appearance = () => {
  const {nodes} = useSelector((state) => state.networkElements);
  const testFn = () => {
    nodes[0].updatePositionRelative(20, 0, 0);
  };
  return (
    <div>
      <button onClick={testFn}>Click here!</button>
    </div>
  );
};

export default Appearance;
