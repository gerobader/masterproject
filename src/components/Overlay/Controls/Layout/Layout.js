import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import * as THREE from 'three';
import Select from '../../UI/Select/Select';
import Button from '../../UI/Button/Button';
import Setting from '../../UI/Setting/Setting';
import SmallNumberInput from '../../UI/SmallNumberInput/SmallNumberInput';
import Loader from '../../UI/Loader/Loader';
import {addToActionHistory} from '../../../../redux/settings/settings.actions';
import {
  fruchtAndReinAttraction, fruchtAndReinRepulsion, eadesAttraction, eadesRepulsion
} from './forceFunctions';

import './Layout.scss';

let interval;
let changes = [];

const Layout = () => {
  const {nodes, edges} = useSelector((state) => state.network);
  const [running, setRunning] = useState(false);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState();
  const [size, setSize] = useState(150);
  const [maxIterations, setMaxIterations] = useState('200');
  const [eadesAttractionMultiplier, setEadesAttractionMultiplier] = useState(1);
  const [eadesAttractionDistanceImpact, setEadesAttractionDistanceImpact] = useState(1);
  const [eadesRepulsionStrength, setEadesRepulsionStrength] = useState(70);
  const dispatch = useDispatch();

  const stopCalculation = () => {
    clearInterval(interval);
    interval = undefined;
    setRunning(false);
    nodes.forEach((node, index) => {
      changes[index].setPositionAbsolute.after = node.position.clone();
    });
    dispatch(addToActionHistory(changes));
    changes = [];
  };

  const forceDirectedPlacement = (type, attractiveForce, repulsiveForce) => {
    const maxIterationsFloat = parseFloat(maxIterations);
    if (type === 1 && !maxIterationsFloat) return;
    // nodes.forEach((node) => {
    //   node.instance.position.clampScalar(-size / 2, size / 2);
    // });
    setRunning(true);
    const area = size * size;
    const k = Math.sqrt(area / nodes.length);
    const temp = new THREE.Vector3(1, 1, 1);
    let iterationCount = 0;
    const iteration = () => {
      iterationCount++;
      nodes.forEach((v) => {
        if (!v.visible) return;
        // repulsive forces
        v.disp.set(0, 0, 0);
        nodes.forEach((u) => {
          if (v !== u && u.visible) {
            const distance = v.position.clone().sub(u.position);
            const length = distance.length() || 0.01;
            const normalizedDistance = distance.clone().normalize();
            v.disp.add(normalizedDistance.multiplyScalar(repulsiveForce({d: length, k, k3: eadesRepulsionStrength})));
          }
        });
      });
      edges.forEach((edge) => {
        if (!edge.visible) return;
        // attractive forces
        const distance = edge.sourceNode.position.clone().sub(edge.targetNode.position);
        const length = distance.length();
        const normalizedDistance = distance.clone().normalize();
        const attractiveForceStrength = attractiveForce({
          d: length, k, k1: eadesAttractionMultiplier, k2: eadesAttractionDistanceImpact
        });
        edge.sourceNode.disp.sub(normalizedDistance.multiplyScalar(attractiveForceStrength));
        edge.targetNode.disp.add(normalizedDistance.multiplyScalar(attractiveForceStrength));
      });
      nodes.forEach((node) => {
        if (!node.visible) return;
        const displacement = node.disp.clone().normalize();
        if (type === 1) displacement.min(temp);
        node.setPositionRelative(displacement, true, size);
      });
      if (type === 1) {
        if (temp.x > 1 / maxIterationsFloat) temp.subScalar(1 / maxIterationsFloat);
        if (iterationCount === maxIterationsFloat) stopCalculation();
      }
    };
    if (!interval) {
      interval = setInterval(() => iteration(), 30);
    }
  };

  const startCalculation = () => {
    nodes.forEach((node) => {
      const elementChanges = {element: node, type: 'graphElement'};
      elementChanges.setPositionAbsolute = {before: node.position.clone()};
      changes.push(elementChanges);
    });
    if (layoutAlgorithm === 'Fruchterman and Reingold') {
      forceDirectedPlacement(1, fruchtAndReinAttraction, fruchtAndReinRepulsion);
    } else if (layoutAlgorithm === 'Eades') {
      forceDirectedPlacement(2, eadesAttraction, eadesRepulsion);
    }
  };

  return (
    <div className="layout-controls">
      <div className="algorithm-wrapper">
        <Select
          options={['Fruchterman and Reingold', 'Eades']}
          defaultOption="- Layout Algorithm -"
          value={layoutAlgorithm}
          setSelected={setLayoutAlgorithm}
          className="extra-wide"
          alwaysShowArrow
        />
        <Button
          onClick={running ? stopCalculation : startCalculation}
          text={running ? 'Stop' : 'Run'}
          className="run"
        />
        {running && <Loader/>}
      </div>
      <div className="settings">
        {layoutAlgorithm === 'Fruchterman and Reingold' && (
          <>
            <Setting name="Size">
              <SmallNumberInput value={size} setValue={setSize}/>
            </Setting>
            <Setting name="Iterations">
              <SmallNumberInput value={maxIterations} setValue={setMaxIterations}/>
            </Setting>
          </>
        )}
        {layoutAlgorithm === 'Eades' && (
          <>
            <Setting name="Size">
              <SmallNumberInput value={size} setValue={setSize}/>
            </Setting>
            <Setting name="Attraction Multiplier">
              <SmallNumberInput value={eadesAttractionMultiplier} setValue={setEadesAttractionMultiplier}/>
            </Setting>
            <Setting name="Attraction Distance Impact">
              <SmallNumberInput value={eadesAttractionDistanceImpact} setValue={setEadesAttractionDistanceImpact}/>
            </Setting>
            <Setting name="Repulsion Strength">
              <SmallNumberInput value={eadesRepulsionStrength} setValue={setEadesRepulsionStrength}/>
            </Setting>
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
