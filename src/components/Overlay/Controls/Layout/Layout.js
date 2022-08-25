import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Vector3, Box3} from 'three';
import MenuElement from '../../UI/MenuElement/MenuElement';
import Select from '../../UI/Select/Select';
import Button from '../../UI/Button/Button';
import Setting from '../../UI/Setting/Setting';
import SmallNumberInput from '../../UI/SmallNumberInput/SmallNumberInput';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Loader from '../../UI/Loader/Loader';
import {
  addToActionHistory,
  setErrorMessage,
  setLayoutCalculationRunning
} from '../../../../redux/settings/settings.actions';
import {
  fruchtAndReinAttraction, fruchtAndReinRepulsion, eadesAttraction, eadesRepulsion
} from './forceFunctions';
import {sortArray} from '../../../utility';

import './Layout.scss';
import layoutIcon from '../../../../assets/layout-icon.svg';

let interval;
let changes = [];

const Layout = () => {
  const {nodes, edges, octree} = useSelector((state) => state.network);
  const {networkBoundarySize, layoutCalculationRunning, axes} = useSelector((state) => state.settings);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState();
  const [c, setC] = useState(1);
  const [size, setSize] = useState(150);
  const [startTemp, setStartTemp] = useState(5);
  const [eadesAttractionStrength, setEadesAttractionStrength] = useState(1);
  const [idealSpringLength, setIdealSpringLength] = useState(1);
  const [eadesRepulsionStrength, setEadesRepulsionStrength] = useState(150);
  const [searchAreaSize, setSearchAreaSize] = useState(50);
  const [xSeparationValue, setXSeparationValue] = useState('none');
  const [ySeparationValue, setYSeparationValue] = useState('none');
  const [zSeparationValue, setZSeparationValue] = useState('none');
  const [freezeAxisSeparation, setFreezeAxisSeparation] = useState(false);
  const dispatch = useDispatch();
  const noeDataPoints = nodes.length ? Object.keys(nodes[0].data) : [];

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
        const forceDirection = v.position.clone().sub(u.position);
        const distance = forceDirection.length() || 0.01;
        const normalizedDirection = forceDirection.normalize();
        v.disp.add(normalizedDirection.multiplyScalar(repulsiveForce({d: distance, k, k3: eadesRepulsionStrength})));
      });
    });
  };

  const calculateAttractiveForces = (attractiveForce, k) => {
    edges.forEach((edge) => {
      if (!edge.visible) return;
      const forceDirection = edge.sourceNode.position.clone().sub(edge.targetNode.position);
      const distance = forceDirection.length();
      const normalizedDirection = forceDirection.normalize();
      const attractiveForceStrength = attractiveForce({
        d: distance, k, k1: eadesAttractionStrength, k2: idealSpringLength
      });
      edge.sourceNode.disp.sub(normalizedDirection.multiplyScalar(attractiveForceStrength));
      edge.targetNode.disp.add(normalizedDirection.multiplyScalar(attractiveForceStrength));
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
        if (freezeAxisSeparation) {
          if (xSeparationValue !== 'none') displacement.setX(0);
          if (ySeparationValue !== 'none') displacement.setY(0);
          if (zSeparationValue !== 'none') displacement.setZ(0);
        }
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

  const separateNodes = (axis, separationValue) => {
    const dataValuesSet = new Set();
    nodes.forEach((node) => dataValuesSet.add(node.data[separationValue]));
    if (dataValuesSet.size < 2) return;
    const positions = {};
    const dataValues = Array.from(dataValuesSet);
    dataValues.sort((a, b) => sortArray(a, b));
    if (typeof dataValues[0] === 'number') {
      const spacePerValue = networkBoundarySize / Math.max(...dataValues);
      dataValues.forEach((dataValue) => {
        positions[dataValue] = (dataValue * spacePerValue) - (networkBoundarySize / 2);
      });
    } else {
      dataValues.forEach((dataValue, index) => {
        positions[dataValue] = ((networkBoundarySize / (dataValues.length - 1)) * index) - (networkBoundarySize / 2);
      });
    }
    const newPosition = new Vector3();
    nodes.forEach((node) => {
      newPosition.set(node.position.x, node.position.y, node.position.z);
      if (axis === 'x') newPosition.setX(positions[node.data[separationValue]]);
      if (axis === 'y') newPosition.setY(positions[node.data[separationValue]]);
      if (axis === 'z') newPosition.setZ(positions[node.data[separationValue]]);
      node.setPositionAbsolute(newPosition);
    });
    axes.setAxisLabel(axis, separationValue);
    axes.addDivisionToAxis(axis, positions);
    if (xSeparationValue === 'none') axes.setAxisLabel('x', 'none');
    if (ySeparationValue === 'none') axes.setAxisLabel('y', 'none');
    if (zSeparationValue === 'none') axes.setAxisLabel('z', 'none');
  };

  const startCalculation = () => {
    if (!nodes.length) {
      dispatch(setErrorMessage('Please load a Network first.'));
      return;
    }
    nodes.forEach((node) => {
      const elementChanges = {element: node, type: 'graphElement'};
      elementChanges.setPositionAbsolute = {before: node.position.clone()};
      changes.push(elementChanges);
    });
    if (layoutAlgorithm === 'Fruchterman and Reingold') {
      forceDirectedPlacement('frucht', fruchtAndReinAttraction, fruchtAndReinRepulsion);
    } else if (layoutAlgorithm === 'Eades') {
      forceDirectedPlacement('eades', eadesAttraction, eadesRepulsion);
    } else if (layoutAlgorithm === 'Separation') {
      if (xSeparationValue !== 'none') separateNodes('x', xSeparationValue);
      if (ySeparationValue !== 'none') separateNodes('y', ySeparationValue);
      if (zSeparationValue !== 'none') separateNodes('z', zSeparationValue);
      nodes.forEach((node, index) => {
        changes[index].setPositionAbsolute.after = node.position.clone();
      });
      dispatch(addToActionHistory(changes));
      changes = [];
    }
  };

  return (
    <MenuElement headline="Layout" icon={layoutIcon}>
      <div className="layout-controls">
        <div className="algorithm-wrapper">
          <Select
            options={['Fruchterman and Reingold', 'Eades', 'Separation']}
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
            disabled={(
              !layoutAlgorithm
              || (layoutAlgorithm === 'Separation'
                && (xSeparationValue === 'none' && ySeparationValue === 'none' && zSeparationValue === 'none'))
            )}
          />
          {layoutCalculationRunning && <Loader/>}
        </div>
        <div className="settings">
          {layoutAlgorithm && layoutAlgorithm !== 'Separation' && (
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
              <Setting name="Freeze Separation">
                <Checkbox name="freeze-axis-separation" checked={freezeAxisSeparation} setChecked={setFreezeAxisSeparation}/>
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
              <Setting name="Freeze Separation">
                <Checkbox name="freeze-axis-separation" checked={freezeAxisSeparation} setChecked={setFreezeAxisSeparation}/>
              </Setting>
            </>
          )}
          {layoutAlgorithm === 'Separation' && (
            <>
              <Setting name="X-Axis">
                <Select
                  options={['none', ...noeDataPoints]}
                  value={xSeparationValue}
                  setSelected={setXSeparationValue}
                  alwaysShowArrow
                />
              </Setting>
              <Setting name="Y-Axis">
                <Select
                  options={['none', ...noeDataPoints]}
                  value={ySeparationValue}
                  setSelected={setYSeparationValue}
                  alwaysShowArrow
                />
              </Setting>
              <Setting name="Z-Axis">
                <Select
                  options={['none', ...noeDataPoints]}
                  value={zSeparationValue}
                  setSelected={setZSeparationValue}
                  alwaysShowArrow
                />
              </Setting>
            </>
          )}
        </div>
      </div>
    </MenuElement>
  );
};

export default Layout;
