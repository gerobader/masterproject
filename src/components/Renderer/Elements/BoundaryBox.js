import * as THREE from 'three';

class BoundaryBox {
  constructor(size, visible, opacity) {
    this.size = size;
    this.opacity = opacity;
    this.visible = visible;
    this.instance = null;
    this.buildGeometry();
  }

  /**
   * creates the geometries and materials of the box to be displayed in the scene
   */
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

  /**
   * sets the size of the boundary box
   * @param size - the new size
   */
  setSize(size) {
    this.size = size;
    this.instance.scale.set(size, size, size);
  }

  /**
   * sets the opacity of the material for the boundary box
   * @param opacity - the new material
   */
  setOpacity(opacity) {
    this.opacity = opacity;
    this.instance.children[1].material.opacity = opacity;
  }

  /**
   * sets the visibility of the boundary box
   * @param visibility - the new visibility
   */
  setVisibility(visibility) {
    this.visible = visibility;
    this.instance.visible = visibility;
  }
}

export default BoundaryBox;
