import * as THREE from 'three';
import Label from './Label';

class Node {
  constructor(x, y, z, r, color, id, label, camera) {
    this.label = null;
    this.id = id;
    this.labelText = label;
    this.instance = null;
    this.buildGeometry(x, y, z, r, color);
    if (label) {
      this.addLabel(camera);
    }
  }

  buildGeometry(x, y, z, r, color) {
    const geometry = new THREE.SphereGeometry(r, 8, 8);
    const material = new THREE.MeshBasicMaterial({color});
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.position.x = x;
    this.instance.position.y = y;
    this.instance.position.z = z;
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
