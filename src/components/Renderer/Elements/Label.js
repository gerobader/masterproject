import {between} from '../../utility';

class Label {
  constructor(text, position, camera) {
    this.text = text;
    this.position = position;
    this.label = null;
    this.isHidden = true;
    this.container = document.getElementById('network-view');
    this.color = '#ffffff';
    this.size = 12;
    this.camera = camera;
    this.createLabel(camera);
  }

  createLabel(camera) {
    const label = document.createElement('div');
    label.className = 'scene-label';
    label.innerHTML = this.text;
    label.style.display = 'none';
    this.label = label;
    this.updatePosition(camera);
    this.container.appendChild(this.label);
  }

  removeFromDom() {
    this.label.remove();
  }

  updatePosition(newParentPosition) {
    if (!this.isHidden) {
      if (newParentPosition) {
        this.position = newParentPosition;
      }
      const currentPosition = this.position.clone();
      this.camera.updateMatrixWorld();
      currentPosition.project(this.camera);
      if (currentPosition.z >= 1 || !between(currentPosition.x, -1, 1) || !between(currentPosition.y, -1, 1)) {
        this.label.style.display = 'none';
        return;
      }
      this.label.style.display = 'block';
      currentPosition.x = (currentPosition.x * (window.innerWidth / 2)) + window.innerWidth / 2 - this.label.offsetWidth / 2;
      currentPosition.y = -(currentPosition.y * (window.innerHeight / 2)) + window.innerHeight / 2 - this.label.offsetHeight / 2;
      this.label.style.left = `${currentPosition.x}px`;
      this.label.style.top = `${currentPosition.y}px`;
    }
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

  hide() {
    if (!this.isHidden) {
      this.isHidden = true;
      this.label.style.display = 'none';
    }
  }

  show() {
    if (this.isHidden) {
      this.isHidden = false;
      this.label.style.display = 'block';
    }
  }
}

export default Label;
