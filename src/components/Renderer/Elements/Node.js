import * as THREE from 'three';
import Label from './Label';

class Node {
  constructor(
    x, y, z, size, color, id, label, data, colorLocked, shape, pathMap, visible, camera, performanceVersion, networkBoundarySize
  ) {
    this.label = null;
    this.id = id;
    this.name = label;
    this.data = data;
    this.instance = null;
    this.targetForEdges = [];
    this.sourceForEdges = [];
    this.color = color;
    this.size = size;
    this.disp = new THREE.Vector3();
    this.pathMap = pathMap;
    this.colorLocked = colorLocked;
    this.shape = shape;
    this.visible = visible;
    this.labelVisible = false;
    this.nodeInstances = undefined;
    this.performanceVersion = performanceVersion;
    this.position = new THREE.Vector3(x, y, z);
    this.networkBoundarySize = networkBoundarySize;
    if (!this.performanceVersion) this.buildGeometry();
    if (label) this.label = new Label(this.name, this.position, camera);
  }

  buildGeometry() {
    const geometry = new THREE.SphereGeometry(this.size, 8, 8);
    const material = new THREE.MeshLambertMaterial({color: this.color});
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.name = 'Node';
    this.instance.position.set(this.position.x, this.position.y, this.position.z);
    if (this.shape && this.shape !== 'Sphere') this.setShape(this.shape);
  }

  calculateDegree() {
    this.data.degree = this.targetForEdges.length + this.sourceForEdges.length;
  }

  setColor(color) {
    if (color && !this.colorLocked) {
      if (this.performanceVersion) {
        this.nodeInstances.setColorFor(this.id, color);
      } else {
        this.instance.material.color.set(color);
      }
      this.color = color;
    }
  }

  setVisibility(visibility) {
    this.visible = visibility;
    if (this.performanceVersion) {
      this.nodeInstances.setVisibilityFor(this.id, visibility, this.position, this.size);
    } else {
      this.instance.visible = visibility;
    }
    this.targetForEdges.forEach((edge) => {
      if (visibility) {
        if (edge.sourceNode.visible) edge.setVisibility(true);
      } else {
        edge.setVisibility(false);
      }
    });
    this.sourceForEdges.forEach((edge) => {
      if (visibility) {
        if (edge.targetNode.visible) edge.setVisibility(true);
      } else {
        edge.setVisibility(false);
      }
    });
    if (!visibility) this.hideLabel(false);
    else if (this.labelVisible) this.showLabel(false);
  }

  showLabel(changeLabelState) {
    if (this.visible) {
      this.label.show();
      this.labelVisible = true;
    }
    if (changeLabelState) this.labelVisible = true;
  }

  hideLabel(changeLabelState) {
    this.label.hide();
    if (changeLabelState) this.labelVisible = false;
  }

  setColorLock(lock) {
    if (lock === true || lock === false) this.colorLocked = lock;
  }

  setSize(size) {
    let newSize = size;
    if (newSize === 0) newSize = 0.001;
    if (!newSize) return;
    newSize = Math.round(parseFloat(newSize) * 1000) / 1000;
    if (newSize !== this.size) {
      if (this.performanceVersion) {
        this.nodeInstances.setSizeFor(this.id, newSize);
      } else {
        this.instance.scale.set(newSize, newSize, newSize);
      }
      this.size = newSize;
      this.targetForEdges.forEach((edge) => edge.updatePosition());
      this.sourceForEdges.forEach((edge) => edge.updatePosition());
    }
  }

  setShape(shape) {
    if (this.performanceVersion) return;
    this.instance.geometry.dispose();
    this.shape = shape;
    switch (shape) {
      case 'Box':
        this.instance.geometry = new THREE.BoxGeometry(this.size * 2, this.size * 2, this.size * 2);
        break;
      case 'Cone':
        this.instance.geometry = new THREE.ConeGeometry(this.size, this.size * 2, 32);
        break;
      case 'Cylinder':
        this.instance.geometry = new THREE.CylinderGeometry(this.size, this.size, this.size * 2, 16);
        break;
      case 'Dodecahedron':
        this.instance.geometry = new THREE.DodecahedronGeometry(this.size);
        break;
      case 'Icosahedron':
        this.instance.geometry = new THREE.IcosahedronGeometry(this.size);
        break;
      case 'Octahedron':
        this.instance.geometry = new THREE.OctahedronGeometry(this.size);
        break;
      case 'Sphere':
        this.instance.geometry = new THREE.SphereGeometry(this.size, 16, 16);
        break;
      case 'Tetrahedron':
        this.instance.geometry = new THREE.TetrahedronGeometry(this.size);
        break;
      case 'Torus':
        this.instance.geometry = new THREE.TorusGeometry(this.size, this.size / 4, 16, 32);
        break;
      case 'Torus Knot':
        this.instance.geometry = new THREE.TorusKnotGeometry(this.size, this.size / 4, 64, 32);
        break;
      default:
        this.instance.geometry = new THREE.SphereGeometry(this.size, 16, 16);
    }
  }

  setLabelColor(color) {
    if (color) {
      this.label.setColor(color);
    }
  }

  setLabelSize(size) {
    if (size) {
      this.label.setSize(size);
    }
  }

  updateAssociatedEdgePosition() {
    this.targetForEdges.forEach((edge) => {
      edge.updatePosition();
    });
    this.sourceForEdges.forEach((edge) => {
      edge.updatePosition();
    });
  }

  setPositionRelative(position) {
    const newPosition = this.position.clone();
    newPosition.add(position);
    this.setPositionAbsolute(newPosition);
  }

  setPositionAbsolute(position) {
    position.clampScalar(-this.networkBoundarySize / 2, this.networkBoundarySize / 2);
    this.position.set(position.x, position.y, position.z);
    if (this.performanceVersion) {
      this.nodeInstances.setPositionFor(this.id, this.position, this.size);
    } else {
      this.instance.position.set(this.position.x, this.position.y, this.position.z);
    }
    this.updateAssociatedEdgePosition();
    this.label.updatePosition(this.position.clone());
  }

  addTargetEdge(edge) {
    if (edge) {
      this.targetForEdges.push(edge);
    }
  }

  addSourceEdge(edge) {
    if (edge) {
      this.sourceForEdges.push(edge);
    }
  }

  setNodeInstances(nodeInstances) {
    this.nodeInstances = nodeInstances;
  }

  setNetworkBoundarySize(size) {
    this.networkBoundarySize = size;
  }

  unserializePathMap(nodes) {
    if (this.pathMap) {
      const unserializedPathMap = {};
      Object.keys(this.pathMap).forEach((index) => {
        const pathInfo = this.pathMap[index];
        unserializedPathMap[index] = {
          distance: pathInfo.distance,
          paths: pathInfo.paths.map((path) => path.map((nodeId) => nodes.find((node) => node.id === nodeId))),
          target: nodes.find((node) => node.id === pathInfo.target)
        };
      });
      this.pathMap = unserializedPathMap;
    }
  }

  serialize(savePathMap) {
    let serializedPathMap;
    if (savePathMap && this.pathMap) {
      serializedPathMap = {};
      Object.keys(this.pathMap).forEach((index) => {
        const pathInfo = this.pathMap[index];
        serializedPathMap[index] = {
          distance: pathInfo.distance,
          paths: pathInfo.paths.map((path) => [...path].map((node) => node.id)),
          target: pathInfo.target.id
        };
      });
    }
    return {
      id: this.id,
      name: this.name,
      data: this.data,
      position: this.position,
      color: this.color,
      size: this.size,
      pathMap: serializedPathMap,
      colorLocked: this.colorLocked,
      shape: this.shape,
      visible: this.visible,
      labelVisible: this.labelVisible
    };
  }
}

export default Node;
