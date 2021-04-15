import * as THREE from 'three';

const getCube = (posX) => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = posX;
  return cube;
};
export default getCube;
