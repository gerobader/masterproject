import * as THREE from 'three';
import Label from './Label';

class Node {
  constructor(x, y, z, r, color, label, camera) {
    this.label = null;
    this.instance = null;
    this.buildGeometry(x, y, z, r, color);
    if (label) {
      this.addLabel(label, camera);
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

  addLabel(text, camera) {
    this.label = new Label(text, this.instance, camera);
  }

  updateLabelPosition(camera) {
    this.label.updatePosition(camera);
  }
}

export default Node;
