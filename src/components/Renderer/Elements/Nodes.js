import * as THREE from 'three';

class Nodes {
  constructor(nodes) {
    this.instances = undefined;
    this.createNodes(nodes);
  }

  /**
   * creates the instanced mesh of all nodes
   * @param nodes - all nodes in the network
   */
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

  /**
   * set the color for a node in the instanced mesh
   * @param index - the index of the node
   * @param color - the new color
   */
  setColorFor(index, color) {
    const threeColor = new THREE.Color(color);
    this.instances.setColorAt(index, threeColor);
    this.instances.instanceColor.needsUpdate = true;
  }

  /**
   * set the visibility of a node in the instanced mesh by replacing its matrix with an empty one or vice versa
   * @param index - the index of the node
   * @param visibility - the new visibility
   * @param position - the position of the node
   * @param size - the size of the node
   */
  setVisibilityFor(index, visibility, position, size) {
    if (!visibility) {
      const emptyMatrix = new THREE.Matrix4().compose(new THREE.Vector3(), new THREE.Quaternion(), new THREE.Vector3());
      this.instances.setMatrixAt(index, emptyMatrix);
    } else {
      this.setPositionFor(index, position, size);
    }
    this.instances.instanceMatrix.needsUpdate = true;
  }

  /**
   * set the position of a node in the instanced mesh
   * @param index - the index of the node
   * @param position - the new position of the node
   * @param size - the size of the node
   */
  setPositionFor(index, position, size) {
    const scale = new THREE.Vector3(size, size, size);
    const nodeMatrix = new THREE.Matrix4().compose(position, new THREE.Quaternion(), scale);
    this.instances.setMatrixAt(index, nodeMatrix);
    this.instances.instanceMatrix.needsUpdate = true;
  }

  /**
   * set the size of a node in the instanced mesh
   * @param index - the index of the node
   * @param size - the new size of the node
   */
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
