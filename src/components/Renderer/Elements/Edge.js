import * as THREE from 'three';
import {halfPi} from '../../constants';

class Edge {
  constructor(id, sourceNode, targetNode, size, color, visible, data, isDirected, edgeInstances) {
    this.id = id;
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
    this.performanceVersion = Boolean(edgeInstances);
    this.edgeInstances = edgeInstances;
    this.instance = null;
    this.size = size;
    this.color = color;
    this.visible = visible;
    this.isDirected = isDirected;
    this.data = data || {};
    if (!this.performanceVersion) this.buildGeometry();
  }

  buildGeometry() {
    const group = new THREE.Group();
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
    const material = new THREE.MeshBasicMaterial({color: this.color});
    material.transparent = true;
    material.opacity = 0.3;
    const edge = new THREE.Mesh(geometry, material);
    edge.name = 'Edge';
    group.add(edge);
    if (this.isDirected) {
      const arrowHeadGeometry = new THREE.ConeGeometry(0.325, 1.5, 16);
      const arrowHead = new THREE.Mesh(arrowHeadGeometry, material);
      arrowHead.name = 'Arrow';
      group.add(arrowHead);
    }
    this.instance = group;
    this.updatePosition();
    this.setRotation();
    if (this.size !== 1) this.setSize(this.size, true);
  }

  updatePosition() {
    if (this.visible) {
      const targetVector = this.targetNode.position.clone();
      const sourceVector = this.sourceNode.position.clone();
      if (this.performanceVersion) {
        this.edgeInstances.updatePositionFor(this.id, sourceVector, targetVector);
      } else {
        const lineVector = targetVector.clone().sub(sourceVector);
        if (this.isDirected) {
          const arrowLength = this.instance.children[1].geometry.parameters.height * this.size;
          this.instance.children[0].scale.y = lineVector.length() - this.targetNode.size - this.sourceNode.size - arrowLength;
          // edge position
          this.instance.children[0].position.y = -(this.targetNode.size - this.sourceNode.size + arrowLength) / 2;
          // arrow position
          this.instance.children[1].position.y = (lineVector.length() / 2) - (this.targetNode.size) - (arrowLength / 2);
        } else {
          this.instance.children[0].scale.y = lineVector.length() - this.targetNode.size - this.sourceNode.size;
        }
        this.instance.position.set(
          (sourceVector.x + targetVector.x) / 2,
          (sourceVector.y + targetVector.y) / 2,
          (sourceVector.z + targetVector.z) / 2
        );
        this.setRotation();
      }
    }
  }

  setRotation() {
    const targetVector = new THREE.Vector3();
    this.targetNode.instance.getWorldPosition(targetVector);
    this.instance.lookAt(targetVector);
    this.instance.rotateX(halfPi); // rotate by 90 degrees
  }

  setColor(color) {
    if (color) {
      if (this.performanceVersion) {
        this.edgeInstances.setColorFor(this.id, color);
      } else {
        this.instance.children[0].material.color.set(color);
        if (this.isDirected) this.instance.children[1].material.color.set(color);
      }
      this.color = color;
    }
  }

  setVisibility(visibility) {
    if (this.performanceVersion) {
      const targetVector = this.targetNode.position.clone();
      const sourceVector = this.sourceNode.position.clone();
      this.edgeInstances.setVisibilityFor(this.id, visibility, sourceVector, targetVector);
    } else {
      this.instance.visible = visibility;
      this.instance.children[0].visible = visibility;
      if (this.isDirected) this.instance.children[1].visible = visibility;
    }
    this.visible = visibility;
  }

  setSize(size, skipCheck) {
    let newSize = size;
    if (newSize === 0) newSize = 0.001;
    if (!newSize) return;
    newSize = Math.round(parseFloat(newSize) * 1000) / 1000;
    if (newSize !== this.size || skipCheck) {
      this.size = newSize;
      if (this.performanceVersion) {
        this.edgeInstances.setSizeFor(this.id, newSize);
      } else {
        this.instance.children[0].scale.set(newSize, 1, newSize);
        if (this.isDirected) this.instance.children[1].scale.set(newSize, newSize, newSize);
        this.updatePosition();
      }
    }
  }

  serialize() {
    return {
      id: this.id,
      source: this.sourceNode.id,
      target: this.targetNode.id,
      size: this.size,
      color: this.color,
      visible: this.visible,
      isDirected: this.isDirected,
      data: this.data
    };
  }
}

export default Edge;
