import * as THREE from 'three';

class Edge {
  constructor(id, sourceNode, targetNode, size, color, visible, edgeInstances) {
    this.id = id;
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
    this.edgeInstances = edgeInstances;
    this.instance = null;
    this.size = size;
    this.color = color;
    this.visible = visible;
    this.rotation = Math.PI / 2;
    // this.buildGeometry();
  }

  buildGeometry() {
    const group = new THREE.Group();
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
    const material = new THREE.MeshBasicMaterial({color: this.color});
    material.transparent = true;
    material.opacity = 0.2;
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
    if (this.size !== 1) this.setSize(this.size, true);

    // lines can be used for edges, which cannot be adjusted in width
    // const material = new THREE.LineBasicMaterial({color: 0xffffff});
    // const points = [];
    // points.push(this.targetNode.instance.position.clone());
    // points.push(this.sourceNode.instance.position.clone());
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // this.instance = new THREE.Line(geometry, material);
  }

  updatePosition() {
    if (this.visible) {
      const targetVector = this.targetNode.instance.position.clone();
      const sourceVector = this.sourceNode.instance.position.clone();
      this.edgeInstances.updatePositionFor(this.id, sourceVector, targetVector);
    }
    // const lineVector = targetVector.clone().sub(sourceVector);
    // const arrowLength = this.instance.children[1].geometry.parameters.height * this.size;
    // this.instance.children[0].scale.y = lineVector.length() - this.targetNode.size - this.sourceNode.size - arrowLength;
    // // edge position
    // this.instance.children[0].position.y = -(this.targetNode.size - this.sourceNode.size + arrowLength) / 2;
    // // arrow position
    // this.instance.children[1].position.y = (lineVector.length() / 2) - (this.targetNode.size) - (arrowLength / 2);
    // this.instance.position.set(
    //   (sourceVector.x + targetVector.x) / 2,
    //   (sourceVector.y + targetVector.y) / 2,
    //   (sourceVector.z + targetVector.z) / 2
    // );
    // this.setRotation();
  }

  setRotation() {
    const targetVector = new THREE.Vector3();
    this.targetNode.instance.getWorldPosition(targetVector);
    this.instance.lookAt(targetVector);
    this.instance.rotateX(this.rotation); // rotate by 90 degrees
  }

  setColor(color) {
    if (color) {
      this.edgeInstances.setColorFor(this.id, color);
      // this.instance.children[0].material.color.set(color);
      // this.instance.children[1].material.color.set(color);
      this.color = color;
    }
  }

  setVisibility(visibility) {
    const targetVector = this.targetNode.instance.position.clone();
    const sourceVector = this.sourceNode.instance.position.clone();
    this.edgeInstances.setVisibilityFor(this.id, visibility, sourceVector, targetVector);
    this.visible = visibility;
    // this.instance.visible = visibility;
    // this.instance.children[0].visible = visibility;
    // this.instance.children[1].visible = visibility;
  }

  setSize(size, skipCheck) {
    if (size !== this.size || skipCheck) {
      this.edgeInstances.setSizeFor(this.id, size);
      // this.instance.children[0].scale.set(size, 1, size);
      // this.instance.children[1].scale.set(size, size, size);
      this.size = size;
      // this.updatePosition();
    }
  }

  serialize() {
    return {
      id: this.id,
      sourceNode: this.sourceNode.id,
      targetNode: this.targetNode.id,
      size: this.size,
      color: this.color,
      visible: this.visible
    };
  }
}

export default Edge;
