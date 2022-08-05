import * as THREE from 'three';
import Label from './Label';

class Axes {
  constructor(size, camera) {
    this.camera = camera;
    this.size = size;
    this.instance = undefined;
    this.xAxisLabel = undefined;
    this.yAxisLabel = undefined;
    this.zAxisLabel = undefined;
    this.xAxisDivisions = [];
    this.yAxisDivisions = [];
    this.zAxisDivisions = [];
    this.visible = false;
    this.axisColor = {x: '#ff0000', y: '#00ff00', z: '#0000ff'};
    this.createAxis();
  }

  createAxis() {
    const axisGroup = new THREE.Group();
    axisGroup.name = 'Axis';
    const xAxisGroup = new THREE.Group();
    xAxisGroup.name = 'xAxis';
    const xAxisMaterial = new THREE.LineBasicMaterial({color: this.axisColor.x});
    const xAxisPoints = [];
    xAxisPoints.push(new THREE.Vector3(-(this.size / 2), -(this.size / 2), -(this.size / 2)));
    xAxisPoints.push(new THREE.Vector3((this.size / 2) + 5, -(this.size / 2), -(this.size / 2)));
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints(xAxisPoints);
    const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
    const xArrowGeo = new THREE.ConeGeometry(1, 4, 16);
    const xArrowMat = new THREE.MeshBasicMaterial({color: this.axisColor.x});
    const xArrow = new THREE.Mesh(xArrowGeo, xArrowMat);
    xArrow.position.set((this.size / 2) + 5, -(this.size / 2), -(this.size / 2));
    xArrow.rotateZ(-1.5708);
    xAxisGroup.add(xAxis, xArrow);

    const yAxisGroup = new THREE.Group();
    yAxisGroup.name = 'yAxis';
    const yAxisMaterial = new THREE.LineBasicMaterial({color: this.axisColor.y});
    const yAxisPoints = [];
    yAxisPoints.push(new THREE.Vector3(-(this.size / 2), -(this.size / 2), -(this.size / 2)));
    yAxisPoints.push(new THREE.Vector3(-(this.size / 2), (this.size / 2) + 5, -(this.size / 2)));
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints(yAxisPoints);
    const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
    const yArrowGeo = new THREE.ConeGeometry(1, 4, 16);
    const yArrowMat = new THREE.MeshBasicMaterial({color: this.axisColor.y});
    const yArrow = new THREE.Mesh(yArrowGeo, yArrowMat);
    yArrow.position.set(-(this.size / 2), (this.size / 2) + 5, -(this.size / 2));
    yAxisGroup.add(yAxis, yArrow);

    const zAxisGroup = new THREE.Group();
    zAxisGroup.name = 'zAxis';
    const zAxisMaterial = new THREE.LineBasicMaterial({color: this.axisColor.z});
    const zAxisPoints = [];
    zAxisPoints.push(new THREE.Vector3(-(this.size / 2), -(this.size / 2), -(this.size / 2)));
    zAxisPoints.push(new THREE.Vector3(-(this.size / 2), -(this.size / 2), (this.size / 2) + 5));
    const zAxisGeometry = new THREE.BufferGeometry().setFromPoints(zAxisPoints);
    const zAxis = new THREE.Line(zAxisGeometry, zAxisMaterial);
    const zArrowGeo = new THREE.ConeGeometry(1, 4, 16);
    const zArrowMat = new THREE.MeshBasicMaterial({color: this.axisColor.z});
    const zArrow = new THREE.Mesh(zArrowGeo, zArrowMat);
    zArrow.position.set(-(this.size / 2), -(this.size / 2), (this.size / 2) + 5);
    zArrow.rotateX(1.5708);
    zAxisGroup.add(zAxis, zArrow);

    axisGroup.add(xAxisGroup);
    axisGroup.add(yAxisGroup);
    axisGroup.add(zAxisGroup);
    this.instance = axisGroup;

    this.xAxisLabel = new Label(
      'none', new THREE.Vector3((this.size / 2) + 15, -(this.size / 2), -(this.size / 2)), this.camera, false, this.axisColor.x
    );
    this.xAxisLabel.setSize(16);
    this.yAxisLabel = new Label(
      'none', new THREE.Vector3(-(this.size / 2), (this.size / 2) + 15, -(this.size / 2)), this.camera, false, this.axisColor.y
    );
    this.yAxisLabel.setSize(16);
    this.zAxisLabel = new Label(
      'none', new THREE.Vector3(-(this.size / 2), -(this.size / 2), (this.size / 2) + 15), this.camera, false, this.axisColor.z
    );
    this.zAxisLabel.setSize(16);
    this.setVisibility(this.visible);
  }

  setAxisLabel(axis, label) {
    if (axis === 'x') this.xAxisLabel.setText(label);
    if (axis === 'y') this.yAxisLabel.setText(label);
    if (axis === 'z') this.zAxisLabel.setText(label);
    this.removeDivisionsFromAxis(axis);
  }

  updateLabelPositions() {
    if (!this.visible) return;
    this.xAxisLabel.updatePosition();
    this.yAxisLabel.updatePosition();
    this.zAxisLabel.updatePosition();
    this.xAxisDivisions.forEach((label) => label.updatePosition());
    this.yAxisDivisions.forEach((label) => label.updatePosition());
    this.zAxisDivisions.forEach((label) => label.updatePosition());
  }

  setPosition(networkBoundarySize) {
    const oldSize = this.size;
    this.size = networkBoundarySize;
    const newPosition = networkBoundarySize / 2;
    this.instance.children.forEach((axisGroup) => {
      const line = axisGroup.children[0];
      line.geometry.attributes.position.array[0] = -newPosition;
      line.geometry.attributes.position.array[1] = -newPosition;
      line.geometry.attributes.position.array[2] = -newPosition;
      line.geometry.attributes.position.array[3] = axisGroup.name === 'xAxis' ? newPosition + 5 : -newPosition;
      line.geometry.attributes.position.array[4] = axisGroup.name === 'yAxis' ? newPosition + 5 : -newPosition;
      line.geometry.attributes.position.array[5] = axisGroup.name === 'zAxis' ? newPosition + 5 : -newPosition;
      line.geometry.attributes.position.needsUpdate = true;
      const arrow = axisGroup.children[1];
      arrow.position.set(
        axisGroup.name === 'xAxis' ? newPosition + 5 : -newPosition,
        axisGroup.name === 'yAxis' ? newPosition + 5 : -newPosition,
        axisGroup.name === 'zAxis' ? newPosition + 5 : -newPosition
      );
    });
    this.xAxisLabel.updatePosition(new THREE.Vector3(newPosition + 15, -newPosition, -newPosition), true);
    this.yAxisLabel.updatePosition(new THREE.Vector3(-newPosition, newPosition + 15, -newPosition), true);
    this.zAxisLabel.updatePosition(new THREE.Vector3(-newPosition, -newPosition, newPosition + 15), true);
    this.xAxisDivisions.forEach((label) => {
      const sizeDifference = networkBoundarySize / oldSize;
      const oldPos = label.position;
      label.updatePosition(
        new THREE.Vector3(oldPos.x * sizeDifference, oldPos.y * sizeDifference, oldPos.z * sizeDifference),
        true
      );
    });
    this.yAxisDivisions.forEach((label) => {
      const sizeDifference = networkBoundarySize / oldSize;
      const oldPos = label.position;
      label.updatePosition(
        new THREE.Vector3(oldPos.x * sizeDifference, oldPos.y * sizeDifference, oldPos.z * sizeDifference),
        true
      );
    });
    this.zAxisDivisions.forEach((label) => {
      const sizeDifference = networkBoundarySize / oldSize;
      const oldPos = label.position;
      label.updatePosition(
        new THREE.Vector3(oldPos.x * sizeDifference, oldPos.y * sizeDifference, oldPos.z * sizeDifference),
        true
      );
    });
  }

  addDivisionToAxis(axis, positions) {
    this.removeDivisionsFromAxis(axis);
    let divisions;
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(Object.keys(positions)[0])) {
      divisions = {0: -this.size / 2};
      const maxValue = Math.max(...Object.keys(positions));
      const stepPerValue = this.size / maxValue;
      let valueIncrement = 1;
      if (maxValue <= 1) valueIncrement = 0.1;
      if (maxValue > 40) valueIncrement = 10;
      if (maxValue > 400) valueIncrement = 100;
      for (let i = valueIncrement; i <= maxValue; i += valueIncrement) {
        divisions[Math.round(i * 10) / 10] = (stepPerValue * i) - (this.size / 2);
      }
    } else {
      divisions = positions;
    }
    Object.keys(divisions).forEach((divisionName) => {
      if (axis === 'x') {
        const label = new Label(
          divisionName,
          new THREE.Vector3(divisions[divisionName], -(this.size / 2) - 3, -(this.size / 2)),
          this.camera,
          !this.visible,
          this.axisColor[axis]
        );
        this.xAxisDivisions.push(label);
      } else if (axis === 'y') {
        const label = new Label(
          divisionName,
          new THREE.Vector3(-(this.size / 2) - 5, divisions[divisionName], -(this.size / 2)),
          this.camera,
          !this.visible,
          this.axisColor[axis]
        );
        this.yAxisDivisions.push(label);
      } else {
        const label = new Label(
          divisionName,
          new THREE.Vector3(-(this.size / 2), (-this.size / 2) - 3, divisions[divisionName]),
          this.camera,
          !this.visible,
          this.axisColor[axis]
        );
        this.zAxisDivisions.push(label);
      }
    });
  }

  removeDivisionsFromAxis(axis) {
    if (axis === 'x') {
      this.xAxisDivisions.forEach((label) => label.removeFromDom());
      this.xAxisDivisions = [];
    } else if (axis === 'y') {
      this.yAxisDivisions.forEach((label) => label.removeFromDom());
      this.yAxisDivisions = [];
    } else if (axis === 'z') {
      this.zAxisDivisions.forEach((label) => label.removeFromDom());
      this.zAxisDivisions = [];
    }
  }

  setVisibility(visibility) {
    this.visible = visibility;
    this.instance.visible = visibility;
    if (visibility) {
      this.xAxisLabel.show();
      this.yAxisLabel.show();
      this.zAxisLabel.show();
      this.xAxisDivisions.forEach((label) => label.show());
      this.yAxisDivisions.forEach((label) => label.show());
      this.zAxisDivisions.forEach((label) => label.show());
    } else {
      this.xAxisLabel.hide();
      this.yAxisLabel.hide();
      this.zAxisLabel.hide();
      this.xAxisDivisions.forEach((label) => label.hide());
      this.yAxisDivisions.forEach((label) => label.hide());
      this.zAxisDivisions.forEach((label) => label.hide());
    }
  }
}

export default Axes;
