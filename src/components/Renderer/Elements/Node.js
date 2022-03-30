import * as THREE from 'three';
import Label from './Label';

class Node {
  constructor(x, y, z, r, color, id, label, data, colorLocked, shape, pathMap, camera) {
    this.label = null;
    this.id = id;
    this.labelText = label;
    this.data = data;
    this.instance = null;
    this.targetForEdges = [];
    this.sourceForEdges = [];
    this.color = color;
    this.colorIsMapped = false;
    this.size = r;
    this.disp = new THREE.Vector3();
    this.pathMap = pathMap;
    this.colorLocked = colorLocked;
    this.buildGeometry(x, y, z, shape);
    if (label) {
      // this.addLabel(camera);
    }
  }

  buildGeometry(x, y, z, shape) {
    const geometry = new THREE.SphereGeometry(this.size, 16, 16);
    const material = new THREE.MeshLambertMaterial({color: this.color});
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.name = 'Node';
    this.instance.position.x = x;
    this.instance.position.y = y;
    this.instance.position.z = z;
    if (shape && shape !== 'Sphere') this.setShape(shape);
  }

  computeStatisticalMeasures(nodes) {
    this.data.degree = this.targetForEdges.length + this.sourceForEdges.length;
    if (nodes.length > 1) {
      const sum = Object.keys(this.pathMap).reduce((prevVal, currVal) => prevVal + this.pathMap[currVal].distance, 0);
      this.data.closeness = sum / (nodes.length - 1);
    }
  }

  setColor(color) {
    if (color && !this.colorLocked) {
      this.color = color;
      this.instance.material.color.set(color);
    }
  }

  setColorLock(lock) {
    if (lock === true || lock === false) this.colorLocked = lock;
  }

  setSize(size) {
    if (size && size !== this.size) {
      const newSize = size / this.size;
      this.instance.geometry.scale(newSize, newSize, newSize);
      this.size = size;
      this.targetForEdges.forEach((edge) => edge.updatePosition());
      this.sourceForEdges.forEach((edge) => edge.updatePosition());
    }
  }

  setShape(shape) {
    this.instance.geometry.dispose();
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

  setPositionRelative(x, y, z, checkBoundaries = false, boundarySize) {
    this.instance.position.x += x;
    this.instance.position.y += y;
    this.instance.position.z += z;
    if (checkBoundaries) {
      this.instance.position.clampScalar(-boundarySize / 2, boundarySize / 2);
    }
    this.updateAssociatedEdgePosition();
  }

  setPositionAbsolute(x, y, z) {
    this.instance.position.x = x;
    this.instance.position.y = y;
    this.instance.position.z = z;
    this.updateAssociatedEdgePosition();
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

  addLabel(camera) {
    this.label = new Label(this.labelText, this.instance, camera);
  }

  removeLabel() {
    this.label.removeFromDom();
  }

  updateLabelPosition(camera) {
    this.label.updatePosition(camera);
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
      labelText: this.labelText,
      data: this.data,
      position: this.instance.position,
      color: this.color,
      size: this.size,
      pathMap: serializedPathMap,
      colorLocked: this.colorLocked,
      shape: this.instance.geometry.type.replace('Geometry', '')
    };
  }
}

export default Node;
