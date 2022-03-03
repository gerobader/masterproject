import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import * as THREE from 'three';
import Select from '../../UI/Select/Select';
import Button from '../../UI/Button/Button';
import Setting from '../../UI/Setting/Setting';
import SmallNumberInput from '../../UI/SmallNumberInput/SmallNumberInput';

import './Layout.scss';
import loader from '../../../../assets/loader.png';

let interval;

const Layout = () => {
  const {nodes, edges} = useSelector((state) => state.networkElements);
  const [running, setRunning] = useState(false);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState();
  const [size, setSize] = useState(150);
  const [maxIterations, setMaxIterations] = useState('200');

  const stopCalculation = () => {
    clearInterval(interval);
    interval = undefined;
    setRunning(false);
  };

  const forceDirectedPlacement = () => {
    const maxIterationsFloat = parseFloat(maxIterations);
    if (!maxIterationsFloat) return;
    setRunning(true);
    // source: https://dcc.fceia.unr.edu.ar/sites/default/files/uploads/materias/fruchterman.pdf
    const area = size * size;
    const k = Math.sqrt(area / nodes.length);
    const attractiveForce = (d) => (d ** 2) / k;
    const repulsiveForce = (d) => (k ** 2) / d;
    const temp = new THREE.Vector3(1, 1, 1);
    let iterationCount = 0;
    const iteration = () => {
      iterationCount++;
      nodes.forEach((v) => {
        // repulsive forces
        v.disp.set(0, 0, 0);
        nodes.forEach((u) => {
          if (v !== u) {
            const distance = v.instance.position.clone().sub(u.instance.position);
            const length = distance.length();
            const normalizedDistance = distance.clone().normalize();
            v.disp.add(normalizedDistance.multiplyScalar(repulsiveForce(length)));
          }
        });
      });
      edges.forEach((edge) => {
        // attractive forces
        const distance = edge.sourceNode.instance.position.clone().sub(edge.targetNode.instance.position);
        const length = distance.length();
        const normalizedDistance = distance.clone().normalize();
        edge.sourceNode.disp.sub(normalizedDistance.multiplyScalar(attractiveForce(length)));
        edge.targetNode.disp.add(normalizedDistance.multiplyScalar(attractiveForce(length)));
      });
      nodes.forEach((node) => {
        const displacement = node.disp.clone().normalize().min(temp);
        node.setPositionRelative(displacement.x, displacement.y, displacement.z, true, size);
      });
      if (temp.x > 1 / maxIterationsFloat) temp.subScalar(1 / maxIterationsFloat);
      if (iterationCount === maxIterationsFloat) stopCalculation();
    };
    if (!interval) {
      interval = setInterval(() => iteration(), 30);
    }
  };

  const startCalculation = () => {
    if (layoutAlgorithm === 'Force-directed Placement') forceDirectedPlacement();
  };

  return (
    <div className="layout-controls">
      <div className="algorithm-wrapper">
        <Select
          options={['Force-directed Placement']}
          defaultOption="- Layout Algorithm -"
          value={layoutAlgorithm}
          setSelected={setLayoutAlgorithm}
          className="algo-select"
        />
        <Button
          onClick={running ? stopCalculation : startCalculation}
          text={running ? 'Stop' : 'Run'}
          className="run"
        />
        {running && <img alt="loader" className="loader" src={loader}/>}
      </div>
      <div className="settings">
        {layoutAlgorithm === 'Force-directed Placement' && (
          <>
            <Setting name="Size">
              <SmallNumberInput value={size} setValue={setSize}/>
            </Setting>
            <Setting name="Iterations">
              <SmallNumberInput value={maxIterations} setValue={setMaxIterations}/>
            </Setting>
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
