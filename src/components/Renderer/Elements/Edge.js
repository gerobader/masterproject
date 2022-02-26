import * as THREE from 'three';

class Edge {
  constructor(sourceNode, targetNode) {
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
    this.instance = null;
    this.size = 1;
    this.buildGeometry();
  }

  buildGeometry() {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
    const material = new THREE.MeshBasicMaterial({color: 0xffffff});
    material.transparent = true;
    material.opacity = 0.5;
    this.instance = new THREE.Mesh(geometry, material);
    this.updatePosition();
    this.setRotation();

    // for performance reasons lines should be used for edges, which cannot be adjusted in width
    // const material = new THREE.LineBasicMaterial({color: 0xffffff});
    // const points = [];
    // points.push(this.targetNode.instance.position.clone());
    // points.push(this.sourceNode.instance.position.clone());
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // this.instance = new THREE.Line(geometry, material);

    this.instance.name = 'Edge';
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

  setColor(color) {
    this.instance.material.color.set(color);
  }

  setSize(size) {
    if (size !== this.size) {
      const newSize = size / this.size;
      this.instance.geometry.scale(newSize, 1, newSize);
      this.size = size;
    }
  }
}

export default Edge;
