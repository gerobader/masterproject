import * as THREE from 'three';

const Sphere = (posX, posY, posZ, radius) => {
  const geometry = new THREE.SphereGeometry(radius, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.x = posX;
  sphere.position.y = posY;
  sphere.position.z = posZ;
  return sphere;
};
export default Sphere;
