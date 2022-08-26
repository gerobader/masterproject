import * as THREE from 'three';
import Label from './Label';

class Node {
  constructor(
    x, y, z, size, color, id, label, data, colorLocked, shape, pathMap, visible, camera, performanceVersion, networkBoundarySize,
    hideLabel
  ) {
    this.label = null;
    this.id = id;
    this.name = label;
    this.data = data;
    this.instance = null;
    this.targetForEdges = [];
    this.sourceForEdges = [];
    this.color = color;
    this.colorLocked = colorLocked;
    this.size = size;
    this.disp = new THREE.Vector3();
    this.pathMap = pathMap;
    this.shape = shape;
    this.visible = visible;
    this.labelVisible = false;
    this.nodeInstances = undefined;
    this.performanceVersion = performanceVersion;
    this.position = new THREE.Vector3(x, y, z);
    this.networkBoundarySize = networkBoundarySize;
    this.isSelected = false;
    if (!this.performanceVersion) this.buildGeometry();
    if (label) this.label = new Label(this.name, this.position, camera, hideLabel);
  }

  /**
   * build the node geometry
   */
  buildGeometry() {
    const geometry = new THREE.SphereGeometry(this.size, 8, 8);
    const material = new THREE.MeshLambertMaterial({color: this.color});
    this.instance = new THREE.Mesh(geometry, material);
    this.instance.name = 'Node';
    this.instance.position.set(this.position.x, this.position.y, this.position.z);
    if (this.shape && this.shape !== 'Sphere') this.setShape(this.shape);
  }

  /**
   * calculate the degree, in-degree and out-degree (for directed networks) of the node
   * @param isDirectedGraph
   */
  calculateDegree(isDirectedGraph) {
    this.data.degree = this.targetForEdges.length + this.sourceForEdges.length;
    if (isDirectedGraph) {
      this.data.inDegree = this.targetForEdges.length;
      this.data.outDegree = this.sourceForEdges.length;
    }
  }

  /**
   * set the color of the node
   * @param color - the new color
   */
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

  /**
   * set the visibility of the node
   * @param visibility - the new visibility
   */
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

  /**
   * show the label of the node
   * @param changeLabelState - change the label state to visible, regardless of if the node is visible ot not
   */
  showLabel(changeLabelState) {
    if (this.visible) {
      if (this.label) this.label.show();
      this.labelVisible = true;
    }
    if (changeLabelState) this.labelVisible = true;
  }

  /**
   * hide the label
   * @param changeLabelState - change the label state to invisible, regardless of if the node is visible or not
   */
  hideLabel(changeLabelState) {
    if (this.label) this.label.hide();
    if (changeLabelState) this.labelVisible = false;
  }

  /**
   * set the color of the node label
   * @param color - the new color
   */
  setLabelColor(color) {
    if (color) {
      this.label.setColor(color);
    }
  }

  /**
   * set the font size of the node label
   * @param size - the new font size
   */
  setLabelSize(size) {
    if (size) {
      this.label.setSize(size);
    }
  }

  /**
   * update the position of the node label
   */
  updateLabelPosition() {
    if (this.label) this.label.updatePosition();
  }

  /**
   * remove the label from the node
   */
  removeLabel() {
    if (this.label) {
      this.label.removeFromDom();
      this.label = null;
    }
  }

  /**
   * set the color lock. if it is true, the color of the node cannot be changed by any means
   * @param lock - true of false
   */
  setColorLock(lock) {
    if (lock === true || lock === false) this.colorLocked = lock;
  }

  /**
   * set the size of the node
   * @param size - the new size
   */
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

  /**
   * set the shape of the node
   * @param shape - the new shape
   */
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

  /**
   * add a property to the data attribute of the node
   * @param name - the name of the property
   * @param value - the value of the property
   */
  setData(name, value) {
    this.data[name] = value;
  }

  /**
   * updates the positions of the edges that are connected to this node when it is moved
   */
  updateAssociatedEdgePosition() {
    this.targetForEdges.forEach((edge) => {
      edge.updatePosition();
    });
    this.sourceForEdges.forEach((edge) => {
      edge.updatePosition();
    });
  }

  /**
   * update the position of the node relative to its current position
   * @param position - the change in position
   */
  setPositionRelative(position) {
    const newPosition = this.position.clone();
    newPosition.add(position);
    this.setPositionAbsolute(newPosition);
  }

  /**
   * set the position of the node
   * @param position - the new position
   */
  setPositionAbsolute(position) {
    position.clampScalar(-this.networkBoundarySize / 2, this.networkBoundarySize / 2);
    this.position.set(position.x, position.y, position.z);
    if (this.performanceVersion) {
      this.nodeInstances.setPositionFor(this.id, this.position, this.size);
    } else {
      this.instance.position.set(this.position.x, this.position.y, this.position.z);
    }
    this.updateAssociatedEdgePosition();
    this.updateLabelPosition();
  }

  /**
   * add an edge that has this node as its target
   * @param edge - the edge to be added
   */
  addTargetEdge(edge) {
    if (edge) {
      this.targetForEdges.push(edge);
    }
  }

  /**
   * add an edge that has this node as its source
   * @param edge - the edge to be added
   */
  addSourceEdge(edge) {
    if (edge) {
      this.sourceForEdges.push(edge);
    }
  }

  /**
   * called when the node is selected (used in performance mode for highlighting)
   */
  select() {
    if (!this.isSelected) {
      this.isSelected = true;
      if (this.performanceVersion) {
        this.setSize(this.size + 0.5);
        this.nodeInstances.setColorFor(this.id, '#00ff00');
      }
    }
  }

  /**
   * called when the node is deselected (used in performance mode for highlighting)
   */
  deselect() {
    if (this.isSelected) {
      this.isSelected = false;
      if (this.performanceVersion) {
        this.setSize(this.size - 0.5);
        this.nodeInstances.setColorFor(this.id, this.color);
      }
    }
  }

  /**
   * set the node instances (used in performance mode)
   * @param nodeInstances
   */
  setNodeInstances(nodeInstances) {
    this.nodeInstances = nodeInstances;
  }

  /**
   * set the size of the boundary so that the node can't be placed outside it
   * @param size
   */
  setNetworkBoundarySize(size) {
    this.networkBoundarySize = size;
  }

  /**
   * check if this node is a neighbor of the given node
   * @param node - the node to check against
   * @returns {boolean}
   */
  isNeighborOf(node) {
    let neighbor;
    neighbor = this.targetForEdges.find((edge) => edge.sourceNode.id === node.id);
    if (!neighbor) {
      neighbor = this.sourceForEdges.find((edge) => edge.targetNode.id === node.id);
    }
    return Boolean(neighbor);
  }

  /**
   * unserializes the path map. used when loading network files that have that info in them
   * @param nodes
   */
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

  /**
   * serializes the node information
   * @param savePathMap - specifies if the path map should be included in the serialized object or not
   * @returns {{}} - the serialized node object
   */
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
