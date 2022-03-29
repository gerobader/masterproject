import * as THREE from 'three';

class Edge {
  constructor(id, sourceNode, targetNode) {
    this.id = id;
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
    this.instance = null;
    this.size = 1;
    this.buildGeometry();
  }

  buildGeometry() {
    const group = new THREE.Group();
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
    const material = new THREE.MeshBasicMaterial({color: 0xffffff});
    material.transparent = true;
    material.opacity = 0.5;
    const edge = new THREE.Mesh(geometry, material);
    edge.name = 'Edge';
    group.add(edge);
    const arrowHeadGeometry = new THREE.ConeGeometry(0.325, 1.5, 16);
    const arrowHead = new THREE.Mesh(arrowHeadGeometry, material);
    arrowHead.name = 'Arrow';
    group.add(arrowHead);
    this.instance = group;
    this.updatePosition();
    this.setRotation();

    // lines can be used for edges, which cannot be adjusted in width
    // const material = new THREE.LineBasicMaterial({color: 0xffffff});
    // const points = [];
    // points.push(this.targetNode.instance.position.clone());
    // points.push(this.sourceNode.instance.position.clone());
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // this.instance = new THREE.Line(geometry, material);
  }

  updatePosition() {
    const targetVector = this.targetNode.instance.position.clone();
    const sourceVector = this.sourceNode.instance.position.clone();
    const lineVector = targetVector.clone().sub(sourceVector);
    this.instance.children[0].scale.y = lineVector.length() - this.targetNode.size - this.sourceNode.size - this.instance.children[1].geometry.parameters.height;
    this.instance.children[0].position.y = -(this.targetNode.size - this.sourceNode.size + this.instance.children[1].geometry.parameters.height) / 2;
    this.instance.children[1].position.y = (lineVector.length() / 2) - (this.targetNode.size) - (this.instance.children[1].geometry.parameters.height / 2);
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
    if (color) {
      this.instance.children[0].material.color.set(color);
      this.instance.children[1].material.color.set(color);
    }
  }

  setSize(size) {
    if (size !== this.size) {
      const newSize = size / this.size;
      this.instance.children[0].geometry.scale(newSize, 1, newSize);
      this.size = size;
    }
  }
}

export default Edge;
