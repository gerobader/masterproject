import * as THREE from 'three';
import {between} from '../../utility';

class Label {
  constructor(text, parent, camera) {
    this.text = text;
    this.parent = parent;
    this.position = null;
    this.label = null;
    this.isHidden = true;
    this.container = document.getElementById('network-view');
    this.color = '#ffffff';
    this.size = 12;
    this.createLabel(camera);
  }

  createLabel(camera) {
    const label = document.createElement('div');
    label.className = 'scene-label';
    label.innerHTML = this.text;
    this.label = label;
    this.updatePosition(camera);
    this.container.appendChild(this.label);
  }

  removeFromDom() {
    this.label.remove();
  }

  updatePosition(camera) {
    const position = new THREE.Vector3();
    this.parent.getWorldPosition(position);
    camera.updateMatrixWorld();
    position.project(camera);
    if (position.z >= 1 || !between(position.x, -1, 1) || !between(position.y, -1, 1)) {
      this.label.style.display = 'none';
      return;
    }
    position.x = (position.x * (window.innerWidth / 2)) + window.innerWidth / 2 - this.label.offsetWidth / 2;
    position.y = -(position.y * (window.innerHeight / 2)) + window.innerHeight / 2 - this.label.offsetHeight / 2;
    this.label.style.left = `${position.x}px`;
    this.label.style.top = `${position.y}px`;
    this.label.style.display = 'block';
    this.position = position;
  }

  setColor(color) {
    if (color) {
      this.color = color;
      this.label.style.color = color;
    }
  }

  setSize(size) {
    if (size) {
      this.size = size;
      this.label.style.fontSize = `${size}px`;
    }
  }
}

export default Label;
