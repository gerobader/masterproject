import * as THREE from 'three';

class InstancedEdge {
  constructor(id, sourceNode, targetNode, matrix, size, color, visible) {
    this.id = id;
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
    this.matrix = matrix;
    this.size = size;
    this.color = color;
    this.visible = visible;
  }
}

export default InstancedEdge;
