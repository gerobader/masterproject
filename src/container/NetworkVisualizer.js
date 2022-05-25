import React, {useState} from 'react';
import Renderer from '../components/Renderer/Renderer';
import Overlay from '../components/Overlay/Overlay';
import StartScreen from '../components/StartScreen/StartScreen';

import './NetworkVisualizer.scss';

const NetworkVisualizer = () => {
  const [networkInfo, setNetworkInfo] = useState(false);
  const [use2Dimensions, setUse2Dimensions] = useState(false);
  return (
    <div>
      {!networkInfo ? (
        <StartScreen setNetworkInfo={setNetworkInfo} use2Dimensions={use2Dimensions} setUse2Dimensions={setUse2Dimensions}/>
      ) : (
        <>
          <Renderer
            remoteNodes={networkInfo.nodes}
            remoteEdges={networkInfo.edges}
            use2Dimensions={use2Dimensions}
            isDirected={networkInfo.isDirected}
          />
          <Overlay/>
        </>
      )}
    </div>
  );
};

export default NetworkVisualizer;
