import * as THREE from 'three';

class Edges {
  constructor(edges, nodes, color) {
    this.instances = undefined;
    this.createEdges(edges, nodes, color);
  }

  createEdges(edges, nodes, color) {
    const defaultMat = new THREE.MeshBasicMaterial();
    defaultMat.transparent = true;
    defaultMat.opacity = 0.3;
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
    const threeColor = new THREE.Color(color);
    const instances = new THREE.InstancedMesh(geometry, defaultMat, edges.length);
    edges.forEach((edge, index) => {
      const sourceNode = nodes.find((node) => {
        if (typeof edge.source === 'string') return node.name === edge.source;
        return node.id === edge.source;
      });
      const targetNode = nodes.find((node) => {
        if (typeof edge.source === 'string') return node.name === edge.target;
        return node.id === edge.target;
      });
      const targetVector = targetNode.position.clone();
      const sourceVector = sourceNode.position.clone();
      const lineVector = targetVector.clone().sub(sourceVector);
      const position = new THREE.Vector3(
        (sourceVector.x + targetVector.x) / 2,
        (sourceVector.y + targetVector.y) / 2,
        (sourceVector.z + targetVector.z) / 2
      );

      const rotationObject = new THREE.Object3D();
      rotationObject.position.set(position.x, position.y, position.z);
      rotationObject.lookAt(targetVector);
      rotationObject.rotateX(Math.PI / 2);
      const rotation = new THREE.Quaternion();
      rotation.setFromAxisAngle(rotationObject.rotation, Math.PI / 2);

      const scale = new THREE.Vector3(1, lineVector.length(), 1);
      const edgeMatrix = new THREE.Matrix4().compose(position, rotationObject.quaternion.clone(), scale);
      instances.setMatrixAt(index, edgeMatrix);
      instances.setColorAt(index, threeColor);
    });
    this.instances = instances;
  }

  updatePositionFor(index, sourceVector, targetVector) {
    const lineVector = targetVector.clone().sub(sourceVector);
    const position = new THREE.Vector3(
      (sourceVector.x + targetVector.x) / 2,
      (sourceVector.y + targetVector.y) / 2,
      (sourceVector.z + targetVector.z) / 2
    );
    const rotationObject = new THREE.Object3D();
    rotationObject.position.set(position.x, position.y, position.z);
    rotationObject.lookAt(targetVector);
    rotationObject.rotateX(Math.PI / 2);
    const rotation = new THREE.Quaternion();
    rotation.setFromAxisAngle(rotationObject.rotation, Math.PI / 2);
    const scale = new THREE.Vector3(1, lineVector.length(), 1);
    const edgeMatrix = new THREE.Matrix4().compose(position, rotationObject.quaternion.clone(), scale);
    this.instances.setMatrixAt(index, edgeMatrix);
    this.instances.instanceMatrix.needsUpdate = true;
  }

  setColorFor(index, color) {
    const threeColor = new THREE.Color(color);
    this.instances.setColorAt(index, threeColor);
    this.instances.instanceColor.needsUpdate = true;
  }

  setVisibilityFor(index, visibility, sourceVector, targetVector) {
    if (!visibility) {
      const emptyMatrix = new THREE.Matrix4().compose(new THREE.Vector3(), 0, new THREE.Vector3());
      this.instances.setMatrixAt(index, emptyMatrix);
    } else {
      this.updatePositionFor(index, sourceVector, targetVector);
    }
    this.instances.instanceMatrix.needsUpdate = true;
  }

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