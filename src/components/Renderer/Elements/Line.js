import * as THREE from 'three';

const Line = (startPos, endPos) => {
  const material = new THREE.LineBasicMaterial({ color: 0x006600 });
  const points = [];
  points.push(new THREE.Vector3(startPos.x, startPos.y, startPos.z));
  points.push(new THREE.Vector3(endPos.x, endPos.y, endPos.z));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, material);
};
export default Line;
