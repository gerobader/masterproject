import {between} from '../../utility';

class Label {
  constructor(text, position, camera, hidden, color = '#ffffff') {
    this.text = text;
    this.position = position;
    this.instance = null;
    this.isHidden = hidden;
    this.container = document.getElementById('network-view');
    this.color = color;
    this.size = 12;
    this.camera = camera;
    this.createLabel();
  }

  createLabel() {
    const label = document.createElement('div');
    label.className = 'scene-label';
    label.innerHTML = this.text;
    label.style.color = this.color;
    if (this.isHidden) label.style.display = 'none';
    this.instance = label;
    this.updatePosition();
    this.container.appendChild(this.instance);
  }

  removeFromDom() {
    this.instance.remove();
  }

  updatePosition(newParentPosition, forceUpdate) {
    if (!this.isHidden || forceUpdate) {
      if (newParentPosition) {
        this.position = newParentPosition;
      }
      const currentPosition = this.position.clone();
      this.camera.updateMatrixWorld();
      currentPosition.project(this.camera);
      if (currentPosition.z >= 1 || !between(currentPosition.x, -1, 1) || !between(currentPosition.y, -1, 1)) {
        this.instance.style.display = 'none';
        return;
      }
      if (!forceUpdate) this.instance.style.display = 'block';
      currentPosition.x = (currentPosition.x * (window.innerWidth / 2)) + window.innerWidth / 2 - this.instance.offsetWidth / 2;
      currentPosition.y = -(currentPosition.y * (window.innerHeight / 2))
        + window.innerHeight / 2 - this.instance.offsetHeight / 2;
      this.instance.style.left = `${currentPosition.x}px`;
      this.instance.style.top = `${currentPosition.y}px`;
    }
  }

  setColor(color) {
    if (color) {
      this.color = color;
      this.instance.style.color = color;
    }
  }

  setSize(size) {
    if (size) {
      this.size = size;
      this.instance.style.fontSize = `${size}px`;
    }
  }

  setText(text) {
    this.text = text;
    this.instance.innerHTML = text;
  }

  hide() {
    if (!this.isHidden) {
      this.isHidden = true;
      this.instance.style.display = 'none';
    }
  }

  show() {
    if (this.isHidden) {
      this.isHidden = false;
      this.instance.style.display = 'block';
    }
  }
}

export default Label;
