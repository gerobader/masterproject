import * as THREE from 'three';
import Label from './Label';

class Node {
  constructor(x, y, z, r, color, id, label, camera) {
    this.label = null;
    this.id = id;
    this.labelText = label;
    this.instance = null;
    this.incomingEdges = [];
    this.outgoingEdges = [];
    this.color = color;
    this.colorIsMapped = false;
    this.buildGeometry(x, y, z, r, color);
    if (label) {
      this.addLabel(camera);
    }
  }

  buildGeometry(x, y, z, r, color) {
    const geometry = new THREE.SphereGeometry(r, 8, 8);
    const material = new THREE.MeshBasicMaterial({color});
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.name = 'Node';
    this.instance.position.x = x;
    this.instance.position.y = y;
    this.instance.position.z = z;
  }

  setColor(color) {
    this.instance.material.color.set(color);
  }

  setLabelColor(color) {
    this.label.setColor(color);
  }

  updateAssociatedEdgePosition() {
    this.incomingEdges.forEach((edge) => {
      edge.updatePosition();
    });
    this.outgoingEdges.forEach((edge) => {
      edge.updatePosition();
    });
  }

  setPositionRelative(x, y, z) {
    this.instance.position.x += x;
    this.instance.position.y += y;
    this.instance.position.z += z;
    this.updateAssociatedEdgePosition();
  }

  setPositionAbsolute(x, y, z) {
    this.instance.position.x = x;
    this.instance.position.y = y;
    this.instance.position.z = z;
    this.updateAssociatedEdgePosition();
  }

  addIncomingEdge(edge) {
    this.incomingEdges.push(edge);
  }

  addOutgoingEdge(edge) {
    this.outgoingEdges.push(edge);
  }

  addLabel(camera) {
    this.label = new Label(this.labelText, this.instance, camera);
  }

  removeLabel() {
    this.label.removeFromDom();
  }

  updateLabelPosition(camera) {
    this.label.updatePosition(camera);
  }
}

export default Node;
