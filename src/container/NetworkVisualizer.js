import React, {useState} from 'react';
import Renderer from '../components/Renderer/Renderer';
import Controls from '../components/Controls/Controls';

import './NetworkVisualizer.scss';

const NetworkVisualizer = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <Renderer count={count}/>
      <Controls count={count} setCount={setCount}/>
    </div>
  );
};

export default NetworkVisualizer;
