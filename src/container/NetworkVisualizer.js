import React from 'react';
import Renderer from '../components/Renderer/Renderer';
import Overlay from '../components/Overlay/Overlay';

import './NetworkVisualizer.scss';

const NetworkVisualizer = () => (
  <div>
    <Renderer/>
    <Overlay/>
  </div>
);

export default NetworkVisualizer;
