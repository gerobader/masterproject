import * as THREE from 'three';
import {halfPi} from '../../constants';

class Edges {
  constructor(edges, nodes) {
    this.instances = undefined;
    this.createEdges(edges, nodes);
  }

  /**
   * creates the instanced mesh of all edges
   * @param edges - all edges in the network
   */
  createEdges(edges) {
    const defaultMat = new THREE.MeshBasicMaterial();
    defaultMat.transparent = true;
    defaultMat.opacity = 0.3;
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
    const color = new THREE.Color();
    const instances = new THREE.InstancedMesh(geometry, defaultMat, edges.length);
    instances.name = 'EdgeInstances';
    edges.forEach((edge, index) => {
      const edgeMatrix = this.getTransformMatrix(edge.sourceNode.position.clone(), edge.targetNode.position.clone());
      if (edge.size) edgeMatrix.scale(new THREE.Vector3(edge.size, 1, edge.size));
      instances.setMatrixAt(index, edgeMatrix);
      instances.setColorAt(index, color.set(edge.color || '#ffffff'));
    });
    this.instances = instances;
  }

  /**
   * updates the position of an edge in the instanced mesh
   * @param index - index of the edge
   * @param size - the size of the edge
   * @param sourceVector - source node position of the edge
   * @param targetVector - target node position of the edge
   */
  updatePositionFor(index, size, sourceVector, targetVector) {
    this.instances.setMatrixAt(index, this.getTransformMatrix(sourceVector, targetVector));
    this.setSizeFor(index, size);
  }

  /**
   * get the transformation matrix of the edge based on its source and target node
   * @param sourceVector - source node position of the edge
   * @param targetVector - target node position of the edge
   * @returns {Matrix4} - the transformation matrix
   */
  // eslint-disable-next-line class-methods-use-this
  getTransformMatrix(sourceVector, targetVector) {
    const position = new THREE.Vector3(
      (sourceVector.x + targetVector.x) / 2,
      (sourceVector.y + targetVector.y) / 2,
      (sourceVector.z + targetVector.z) / 2
    );
    const rotationObject = new THREE.Object3D();
    rotationObject.position.set(position.x, position.y, position.z);
    rotationObject.lookAt(targetVector);
    rotationObject.rotateX(halfPi);
    const rotation = new THREE.Quaternion();
    rotation.setFromAxisAngle(rotationObject.rotation, halfPi);
    const lineVector = targetVector.clone().sub(sourceVector);
    const scale = new THREE.Vector3(1, lineVector.length(), 1);
    return new THREE.Matrix4().compose(position, rotationObject.quaternion.clone(), scale);
  }

  /**
   * sets the color for an edge in the instanced mesh
   * @param index - index of the edge
   * @param color - new color for the edge
   */
  setColorFor(index, color) {
    const threeColor = new THREE.Color(color);
    this.instances.setColorAt(index, threeColor);
    this.instances.instanceColor.needsUpdate = true;
  }

  /**
   * sets the visibility for an edge in the instanced mesh
   * @param index - index of the edge
   * @param visibility - new visibility of the edge
   * @param size - size of the edge
   * @param sourceVector - source node position of the edge
   * @param targetVector - target node position of the edge
   */
  setVisibilityFor(index, visibility, size, sourceVector, targetVector) {
    if (!visibility) {
      const emptyMatrix = new THREE.Matrix4().compose(new THREE.Vector3(), 0, new THREE.Vector3());
      this.instances.setMatrixAt(index, emptyMatrix);
    } else {
      this.updatePositionFor(index, size, sourceVector, targetVector);
    }
    this.instances.instanceMatrix.needsUpdate = true;
  }

  /**
   * set the size for an edge in the instanced mesh
   * @param index - index of the edge
   * @param size - new size of the edge
   */
  setSizeFor(index, size) {
    const matrix = new THREE.Matrix4();
    this.instances.getMatrixAt(index, matrix);
    const scale = new THREE.Vector3();
    scale.setFromMatrixScale(matrix);
    matrix.scale(new THREE.Vector3(size / scale.x, 1, size / scale.z));
    this.instances.setMatrixAt(index, matrix);
    this.instances.instanceMatrix.needsUpdate = true;
  }
}

export default Edges;
