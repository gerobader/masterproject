import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import Select from '../../UI/Select/Select';
import * as THREE from 'three';

import './Layout.scss';
import Button from "../../UI/Button/Button";

let interval;

const Layout = () => {
  const {nodes, edges} = useSelector((state) => state.networkElements);
  const [layoutAlgorithm, setLayoutAlgorithm] = useState();
  const forceDirectedPlacement = () => {
    // source: https://dcc.fceia.unr.edu.ar/sites/default/files/uploads/materias/fruchterman.pdf
    const area = 150 * 150;
    const k = Math.sqrt(area / nodes.length);
    const attractiveForce = (d) => (d ** 2) / k;
    const repulsiveForce = (d) => (k ** 2) / d;
    const temp = new THREE.Vector3(1, 1, 1);
    const iteration = (iterationCount) => {
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
        node.setPositionRelative(displacement.x, displacement.y, displacement.z, true, 130);
      });
      if (temp.x > 0.01) temp.subScalar(0.01);
      if (iterationCount > 1) {
        setTimeout(() => iteration(iterationCount - 1), 30);
      }
    };
    if (!interval) interval = setInterval(() => iteration(1), 30);
  };

  const stopCalculation = () => {
    clearInterval(interval);
    interval = undefined;
  };

  return (
    <div className="layout-controls">
      <div className="algorithm-wrapper">
        <Select
          options={['Force Directed Placement']}
          value={layoutAlgorithm}
          setSelected={setLayoutAlgorithm}
          className="algo-select"
        />
        <Button onClick={forceDirectedPlacement} text="Run"/>
      </div>
      <button onClick={forceDirectedPlacement}>Click here!</button>
      <button onClick={stopCalculation}>End Calculation!</button>
    </div>
  );
};

export default Layout;
