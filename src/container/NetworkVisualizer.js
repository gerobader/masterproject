import React, {useState} from 'react';
import Renderer from '../components/Renderer/Renderer';
import Overlay from '../components/Overlay/Overlay';
import StartScreen from '../components/StartScreen/StartScreen';

import './NetworkVisualizer.scss';

const NetworkVisualizer = () => {
  const [elements, setElements] = useState(false);
  const [use2Dimensions, setUse2Dimensions] = useState(false);
  return (
    <div>
      {!elements ? (
        <StartScreen setElements={setElements} use2Dimensions={use2Dimensions} setUse2Dimensions={setUse2Dimensions}/>
      ) : (
        <>
          <Renderer remoteNodes={elements.nodes} remoteEdges={elements.edges} use2Dimensions={use2Dimensions}/>
          <Overlay/>
        </>
      )}
    </div>
  );
};

export default NetworkVisualizer;
