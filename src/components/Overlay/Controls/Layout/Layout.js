import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Vector3, Box3} from 'three';
import MenuElement from '../../UI/MenuElement/MenuElement';
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
import layoutIcon from '../../../../assets/layout-icon.svg';

let interval;
let changes = [];

const Layout = () => {
  const {nodes, edges, octree} = useSelector((state) => state.network);
  const {networkBoundarySize, layoutCalculationRunning} = useSelector((state) => state.settings);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState();
  const [c, setC] = useState(1);
  const [size, setSize] = useState(150);
  const [startTemp, setStartTemp] = useState(5);
  const [eadesAttractionStrength, setEadesAttractionStrength] = useState(1);
  const [idealSpringLength, setIdealSpringLength] = useState(1);
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

  const calculateRepulsiveForces = (repulsiveForce, k, searchArea, type, useOctree) => {
    nodes.forEach((v) => {
      if (!v.visible) return;
      v.disp.set(0, 0, 0);
      let repulsiveNodes = nodes;
      if (useOctree) {
        searchArea.set(
          new Vector3(v.position.x - searchAreaSize / 2, v.position.y - searchAreaSize / 2, v.position.z - searchAreaSize / 2),
          new Vector3(v.position.x + searchAreaSize / 2, v.position.y + searchAreaSize / 2, v.position.z + searchAreaSize / 2)
        );
        repulsiveNodes = octree.query(searchArea);
      }
      repulsiveNodes.forEach((u) => {
        if (!u.visible || v.id === u.id || (type === 'eades' && u.isNeighborOf(v))) return;
        const distance = v.position.clone().sub(u.position);
        const length = distance.length() || 0.01;
        const normalizedDistance = distance.clone().normalize();
        v.disp.add(normalizedDistance.multiplyScalar(repulsiveForce({d: length, k, k3: eadesRepulsionStrength})));
      });
    });
  };

  const calculateAttractiveForces = (attractiveForceFunction, k) => {
    edges.forEach((edge) => {
      if (!edge.visible) return;
      const distance = edge.sourceNode.position.clone().sub(edge.targetNode.position);
      const length = distance.length();
      const normalizedDistance = distance.clone().normalize();
      const attractiveForceStrength = attractiveForceFunction({
        d: length, k, k1: eadesAttractionStrength, k2: idealSpringLength
      });
      edge.sourceNode.disp.sub(normalizedDistance.multiplyScalar(attractiveForceStrength));
      edge.targetNode.disp.add(normalizedDistance.multiplyScalar(attractiveForceStrength));
    });
  };

  const forceDirectedPlacement = (type, attractiveForce, repulsiveForce) => {
    let temp = parseFloat(startTemp);
    if (type === 'frucht' && !temp) return;
    dispatch(setLayoutCalculationRunning(true));
    const area = size * size;
    const k = c * Math.sqrt(area / nodes.length);
    const searchArea = new Box3();
    const useOctree = searchAreaSize < networkBoundarySize;
    const iteration = () => {
      if (useOctree) {
        octree.empty();
        octree.update = true;
        nodes.forEach((node) => {
          if (node.visible) octree.insert(node);
        });
      }
      calculateRepulsiveForces(repulsiveForce, k, searchArea, type, useOctree);
      calculateAttractiveForces(attractiveForce, k);
      nodes.forEach((node) => {
        if (!node.visible) return;
        const displacement = node.disp.clone().normalize();
        if (type === 'frucht') displacement.multiplyScalar(temp);
        node.setPositionRelative(displacement);
      });
      if (type === 'frucht') {
        temp -= (parseFloat(startTemp) / 100);
        if (temp <= 0) stopCalculation();
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
      forceDirectedPlacement('frucht', fruchtAndReinAttraction, fruchtAndReinRepulsion);
    } else if (layoutAlgorithm === 'Eades') {
      forceDirectedPlacement('eades', eadesAttraction, eadesRepulsion);
    }
  };

  return (
    <MenuElement headline="Layout" icon={layoutIcon}>
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
            className={`run${layoutCalculationRunning ? ' danger' : ''}`}
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
              <Setting name="C">
                <SmallNumberInput value={c} setValue={setC}/>
              </Setting>
              <Setting name="Temperature">
                <SmallNumberInput value={startTemp} setValue={setStartTemp}/>
              </Setting>
            </>
          )}
          {layoutAlgorithm === 'Eades' && (
            <>
              <Setting name="Repulsion Strength">
                <SmallNumberInput value={eadesRepulsionStrength} setValue={setEadesRepulsionStrength}/>
              </Setting>
              <Setting name="Attraction Strength">
                <SmallNumberInput value={eadesAttractionStrength} setValue={setEadesAttractionStrength}/>
              </Setting>
              <Setting name="Ideal Spring Length">
                <SmallNumberInput value={idealSpringLength} setValue={setIdealSpringLength}/>
              </Setting>
            </>
          )}
        </div>
      </div>
    </MenuElement>
  );
};

export default Layout;
