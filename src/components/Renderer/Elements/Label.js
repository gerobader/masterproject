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

  /**
   * creates the label as a DOM element
   */
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

  /**
   * removes the label from the DOM
   */
  removeFromDom() {
    this.instance.remove();
  }

  /**
   * updates the label position
   * @param newParentPosition - the position of the parent of the label
   * @param forceUpdate - force the position update event when the edge is hidden
   */
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

  /**
   * set the color of the label
   * @param color - the new color
   */
  setColor(color) {
    if (color) {
      this.color = color;
      this.instance.style.color = color;
    }
  }

  /**
   * set the size of the label font
   * @param size - the new font size
   */
  setSize(size) {
    if (size) {
      this.size = size;
      this.instance.style.fontSize = `${size}px`;
    }
  }

  /**
   * set the text of the label
   * @param text - the new text for the label
   */
  setText(text) {
    this.text = text;
    this.instance.innerHTML = text;
  }

  /**
   * hide the label
   */
  hide() {
    if (!this.isHidden) {
      this.isHidden = true;
      this.instance.style.display = 'none';
    }
  }

  /**
   * show the label
   */
  show() {
    if (this.isHidden) {
      this.isHidden = false;
      this.instance.style.display = 'block';
    }
  }
}

export default Label;
