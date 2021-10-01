import * as THREE from 'three';

class Label {
  constructor(text, parent, camera) {
    this.text = text;
    this.parent = parent;
    this.position = null;
    this.label = null;
    this.container = document.getElementById('network-view');
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

  updatePosition(camera) {
    const position = new THREE.Vector3();
    this.parent.getWorldPosition(position);
    camera.updateMatrixWorld();
    position.project(camera);
    position.x = (position.x * (window.innerWidth / 2)) + window.innerWidth / 2 - this.label.offsetWidth / 2;
    position.y = -(position.y * (window.innerHeight / 2)) + window.innerHeight / 2 - this.label.offsetHeight / 2;
    this.label.style.left = `${position.x}px`;
    this.label.style.top = `${position.y}px`;
    this.position = position;
  }
}

export default Label;
