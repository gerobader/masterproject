import * as THREE from 'three';

class BoundaryRect {
  constructor(size, visible, opacity) {
    this.size = size;
    this.opacity = opacity;
    this.visible = visible;
    this.instance = null;
    this.buildGeometry();
  }

  buildGeometry() {
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const transparentMat = new THREE.MeshBasicMaterial({color: '#008799'});
    transparentMat.transparent = true;
    transparentMat.opacity = this.opacity;
    const edges = new THREE.EdgesGeometry(geometry);
    const wireframeCube = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: '#008799'}));
    const transparentCube = new THREE.Mesh(geometry, transparentMat);
    group.add(wireframeCube);
    group.add(transparentCube);
    group.visible = this.visible;
    this.instance = group;
    this.instance.scale.set(this.size, this.size, this.size);
    this.instance.name = 'Boundary';
    this.instance.position.set(0, 0, 0);
  }

  setSize(size) {
    this.size = size;
    this.instance.scale.set(size, size, size);
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    this.instance.children[1].material.opacity = opacity;
  }

  setVisibility(visibility) {
    this.visible = visibility;
    this.instance.visible = visibility;
  }
}

export default BoundaryRect;
