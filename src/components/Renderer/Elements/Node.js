import * as THREE from 'three';
import Label from './Label';

class Node {
  constructor(x, y, z, r, color, id, label, camera) {
    this.label = null;
    this.id = id;
    this.labelText = label;
    this.instance = null;
    this.targetForEdges = [];
    this.sourceForEdges = [];
    this.color = color;
    this.colorIsMapped = false;
    this.size = r;
    this.disp = new THREE.Vector3();
    this.buildGeometry(x, y, z, r, color);
    if (label) {
      // this.addLabel(camera);
    }
  }

  buildGeometry(x, y, z, r, color) {
    const geometry = new THREE.SphereGeometry(r, 16, 16);
    const material = new THREE.MeshLambertMaterial({color});
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.name = 'Node';
    this.instance.position.x = x;
    this.instance.position.y = y;
    this.instance.position.z = z;
  }

  stressMajorization(nodes) {
    let completeWeight = 0;
    nodes.forEach((node) => {
      if (node.id !== this.id) {
        const distance = Math.round(this.instance.position.distanceTo(node.instance.position));
        const idealDistance = 15;
        const weight = (distance - idealDistance) ** 2;
        completeWeight += weight;
      }
    });
    return completeWeight;
  }

  setColor(color) {
    this.instance.material.color.set(color);
  }

  setSize(size) {
    if (size !== this.size) {
      const newSize = size / this.size;
      this.instance.geometry.scale(newSize, newSize, newSize);
      this.size = size;
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
    this.label.setColor(color);
  }

  setLabelSize(size) {
    this.label.setSize(size);
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
    this.targetForEdges.push(edge);
  }

  addSourceEdge(edge) {
    this.sourceForEdges.push(edge);
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
