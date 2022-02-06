import * as THREE from 'three';

class Edge {
  constructor(sourceNode, targetNode) {
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
    this.instance = null;
    this.buildGeometry();
  }

  buildGeometry() {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
    const material = new THREE.MeshBasicMaterial({color: new THREE.Color(Math.random(), Math.random(), Math.random())});
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.name = 'Edge';
    this.updatePosition();
    this.setRotation();
  }

  updatePosition() {
    const targetVector = this.targetNode.instance.position.clone();
    const sourceVector = this.sourceNode.instance.position.clone();
    const lineVector = targetVector.clone().sub(sourceVector);
    this.instance.scale.y = lineVector.length();
    this.instance.position.set(
      (sourceVector.x + targetVector.x) / 2,
      (sourceVector.y + targetVector.y) / 2,
      (sourceVector.z + targetVector.z) / 2
    );
    this.setRotation();
  }

  setRotation() {
    const targetVector = this.targetNode.instance.position.clone();
    this.instance.lookAt(targetVector);
    this.instance.rotateX(THREE.Math.degToRad(90));
  }
}

export default Edge;
