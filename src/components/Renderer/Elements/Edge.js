import * as THREE from 'three';
import {halfPi} from '../../constants';

class Edge {
  constructor(id, sourceNode, targetNode, size, color, visible, data, isDirected, performanceMode) {
    this.id = id;
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
    this.performanceVersion = performanceMode;
    this.edgeInstances = null;
    this.instance = null;
    this.size = size;
    this.color = color;
    this.visible = visible;
    this.isDirected = isDirected;
    this.position = new THREE.Vector3(0, 0, 0);
    this.data = data || {};
    this.isSelected = false;
    if (!this.performanceVersion) this.buildGeometry();
  }

  /**
   * initializes the 3d objects used for the edge
   */
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

  /**
   * sets the position of the edge based on its source and target node
   */
  updatePosition() {
    if (this.visible) {
      const targetVector = this.targetNode.position.clone();
      const sourceVector = this.sourceNode.position.clone();
      this.position.set(
        (sourceVector.x + targetVector.x) / 2,
        (sourceVector.y + targetVector.y) / 2,
        (sourceVector.z + targetVector.z) / 2
      );
      if (this.performanceVersion) {
        this.edgeInstances.updatePositionFor(this.id, this.size, sourceVector, targetVector);
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
          this.instance.children[0].position.y = (this.sourceNode.size / 2) - (this.targetNode.size / 2);
          this.instance.children[0].scale.y = lineVector.length() - this.targetNode.size - this.sourceNode.size;
        }
        this.instance.position.set(this.position.x, this.position.y, this.position.z);
        this.setRotation();
      }
    }
  }

  /**
   * sets the rotation of the edge based on its target node
   */
  setRotation() {
    const targetVector = new THREE.Vector3();
    this.targetNode.instance.getWorldPosition(targetVector);
    this.instance.lookAt(targetVector);
    this.instance.rotateX(halfPi); // rotate by 90 degrees
  }

  /**
   * sets the color of the edge
   * @param color - the new color
   */
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

  /**
   * sets the visibility of the edge
   * @param visibility - the new visibility (true / false)
   */
  setVisibility(visibility) {
    if (this.performanceVersion) {
      const targetVector = this.targetNode.position.clone();
      const sourceVector = this.sourceNode.position.clone();
      this.edgeInstances.setVisibilityFor(this.id, visibility, this.size, sourceVector, targetVector);
    } else {
      this.instance.visible = visibility;
      this.instance.children[0].visible = visibility;
      if (this.isDirected) this.instance.children[1].visible = visibility;
    }
    this.visible = visibility;
  }

  /**
   * sets the size of the edge
   * @param size - the new size
   * @param skipCheck - indicates if the check against the previous size should be skipped
   */
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

  /**
   * called when the edge is selected (used in performance mode for highlighting)
   */
  select() {
    if (!this.isSelected) {
      this.isSelected = true;
      this.setSize(this.size + 1);
      this.edgeInstances.setColorFor(this.id, '#00ff00');
    }
  }

  /**
   * called when the edge is deselected (used in performance mode for highlighting)
   */
  deselect() {
    if (this.isSelected) {
      this.isSelected = false;
      this.setSize(this.size - 1);
      this.edgeInstances.setColorFor(this.id, this.color);
    }
  }

  /**
   * set the edge instances (used in performance mode)
   * @param edgeInstances
   */
  setEdgeInstances(edgeInstances) {
    this.edgeInstances = edgeInstances;
  }

  /**
   * serializes the edge information
   * @returns {{visible, isDirected, size, color, data: (*|{}), id, source, target}}
   */
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
