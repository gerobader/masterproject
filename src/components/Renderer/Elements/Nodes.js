import * as THREE from 'three';

class Nodes {
  constructor(nodes) {
    this.instances = undefined;
    this.createNodes(nodes);
  }

  createNodes(nodes) {
    const defaultMat = new THREE.MeshLambertMaterial();
    const geometry = new THREE.SphereGeometry(1, 8, 8);
    const instances = new THREE.InstancedMesh(geometry, defaultMat, nodes.length);
    const color = new THREE.Color();
    instances.name = 'NodeInstances';
    nodes.forEach((node, index) => {
      const scale = new THREE.Vector3(node.size, node.size, node.size);
      const nodeMatrix = new THREE.Matrix4().compose(node.position.clone(), new THREE.Quaternion(), scale);
      instances.setMatrixAt(index, nodeMatrix);
      instances.setColorAt(index, color.set(node.color));
    });
    this.instances = instances;
  }

  setColorFor(index, color) {
    const threeColor = new THREE.Color(color);
    this.instances.setColorAt(index, threeColor);
    this.instances.instanceColor.needsUpdate = true;
  }

  setVisibilityFor(index, visibility, position, size) {
    if (!visibility) {
      const emptyMatrix = new THREE.Matrix4().compose(new THREE.Vector3(), new THREE.Quaternion(), new THREE.Vector3());
      this.instances.setMatrixAt(index, emptyMatrix);
    } else {
      this.setPositionFor(index, position, size);
    }
    this.instances.instanceMatrix.needsUpdate = true;
  }

  setPositionFor(index, position, size) {
    const scale = new THREE.Vector3(size, size, size);
    const nodeMatrix = new THREE.Matrix4().compose(position, new THREE.Quaternion(), scale);
    this.instances.setMatrixAt(index, nodeMatrix);
    this.instances.instanceMatrix.needsUpdate = true;
  }

  setSizeFor(index, size) {
    const matrix = new THREE.Matrix4();
    this.instances.getMatrixAt(index, matrix);
    const scale = new THREE.Vector3();
    scale.setFromMatrixScale(matrix);
    matrix.scale(new THREE.Vector3(size / scale.x, size / scale.y, size / scale.z));
    this.instances.setMatrixAt(index, matrix);
    this.instances.instanceMatrix.needsUpdate = true;
  }
}

export default Nodes;
