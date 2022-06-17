import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Vector3, Box3} from 'three';
import Select from '../../UI/Select/Select';
import Button from '../../UI/Button/Button';
import Setting from '../../UI/Setting/Setting';
import SmallNumberInput from '../../UI/SmallNumberInput/SmallNumberInput';
import Loader from '../../UI/Loader/Loader';
import {addToActionHistory, setLayoutCalculationRunning} from '../../../../redux/settings/settings.actions';
import {
  fruchtAndReinAttraction, fruchtAndReinRepulsion, eadesAttraction, eadesRepulsion
} from './forceFunctions';

import './Layout.scss';

let interval;
let changes = [];

const Layout = () => {
  const {nodes, edges, octree} = useSelector((state) => state.network);
  const {networkBoundarySize, layoutCalculationRunning} = useSelector((state) => state.settings);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState();
  const [size, setSize] = useState(150);
  const [maxIterations, setMaxIterations] = useState('200');
  const [eadesAttractionMultiplier, setEadesAttractionMultiplier] = useState(1);
  const [eadesAttractionDistanceImpact, setEadesAttractionDistanceImpact] = useState(1);
  const [eadesRepulsionStrength, setEadesRepulsionStrength] = useState(150);
  const [searchAreaSize, setSearchAreaSize] = useState(50);
  const dispatch = useDispatch();

  const stopCalculation = () => {
    clearInterval(interval);
    interval = undefined;
    dispatch(setLayoutCalculationRunning(false));
    nodes.forEach((node, index) => {
      changes[index].setPositionAbsolute.after = node.position.clone();
    });
    dispatch(addToActionHistory(changes));
    changes = [];
  };

  const forceDirectedPlacement = (type, attractiveForce, repulsiveForce) => {
    const maxIterationsFloat = parseFloat(maxIterations);
    if (type === 1 && !maxIterationsFloat) return;
    dispatch(setLayoutCalculationRunning(true));
    const area = size * size;
    const k = Math.sqrt(area / nodes.length);
    const temp = new Vector3(1, 1, 1);
    let iterationCount = 0;
    const searchArea = new Box3();
    const useOctree = searchAreaSize < networkBoundarySize;
    const iteration = () => {
      iterationCount++;
      if (useOctree) {
        octree.empty();
        octree.update = true;
        nodes.forEach((node) => {
          if (node.visible) octree.insert({id: node.id, position: node.position.clone()});
        });
      }
      nodes.forEach((v) => {
        if (!v.visible) return;
        // repulsive forces
        v.disp.set(0, 0, 0);
        searchArea.set(
          new Vector3(v.position.x - searchAreaSize / 2, v.position.y - searchAreaSize / 2, v.position.z - searchAreaSize / 2),
          new Vector3(v.position.x + searchAreaSize / 2, v.position.y + searchAreaSize / 2, v.position.z + searchAreaSize / 2)
        );
        const nearbyNodes = useOctree ? octree.query(searchArea) : nodes;
        nearbyNodes.forEach((u) => {
          if (v.id !== u.id) {
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
        node.setPositionRelative(displacement);
      });
      if (type === 1) {
        if (temp.x > 1 / maxIterationsFloat) temp.subScalar(1 / maxIterationsFloat);
        if (iterationCount === maxIterationsFloat) stopCalculation();
      }
    };
    if (!interval) {
      interval = setInterval(iteration, 30);
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
          onClick={layoutCalculationRunning ? stopCalculation : startCalculation}
          text={layoutCalculationRunning ? 'Stop' : 'Run'}
          className="run"
          disabled={!layoutAlgorithm}
        />
        {layoutCalculationRunning && <Loader/>}
      </div>
      <div className="settings">
        {layoutAlgorithm && (
          <Setting name="Max Repulsion Distance">
            <SmallNumberInput value={searchAreaSize} setValue={setSearchAreaSize}/>
          </Setting>
        )}
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
            <Setting name="Repulsion Strength">
              <SmallNumberInput value={eadesRepulsionStrength} setValue={setEadesRepulsionStrength}/>
            </Setting>
            <Setting name="Attraction Multiplier">
              <SmallNumberInput value={eadesAttractionMultiplier} setValue={setEadesAttractionMultiplier}/>
            </Setting>
            <Setting name="Attraction Distance Impact">
              <SmallNumberInput value={eadesAttractionDistanceImpact} setValue={setEadesAttractionDistanceImpact}/>
            </Setting>
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
