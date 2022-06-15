import {
  Box3, Vector3, BoxGeometry, EdgesGeometry, LineSegments, LineBasicMaterial
} from 'three';

class Octree {
  constructor(boundary, capacity) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.nodes = [];
    this.divided = false;
  }

  subdivide() {
    const {max, min} = this.boundary;
    const middleX = (min.x + max.x) / 2;
    const middleY = (min.y + max.y) / 2;
    const middleZ = (min.z + max.z) / 2;
    const bottomBackLeft = new Box3(new Vector3(min.x, min.y, min.z), new Vector3(middleX, middleY, middleZ));
    this.bottomBackLeft = new Octree(bottomBackLeft, this.capacity);
    const topBackLeft = new Box3(new Vector3(min.x, middleY, min.z), new Vector3(middleX, max.y, middleZ));
    this.topBackLeft = new Octree(topBackLeft, this.capacity);
    const topFrontLeft = new Box3(new Vector3(min.x, middleY, middleZ), new Vector3(middleX, max.y, max.z));
    this.topFrontLeft = new Octree(topFrontLeft, this.capacity);
    const bottomFrontLeft = new Box3(new Vector3(min.x, min.y, middleZ), new Vector3(middleX, middleY, max.z));
    this.bottomFrontLeft = new Octree(bottomFrontLeft, this.capacity);

    const bottomBackRight = new Box3(new Vector3(middleX, min.y, min.z), new Vector3(max.x, middleY, middleZ));
    this.bottomBackRight = new Octree(bottomBackRight, this.capacity);
    const topBackRight = new Box3(new Vector3(middleX, middleY, min.z), new Vector3(max.x, max.y, middleZ));
    this.topBackRight = new Octree(topBackRight, this.capacity);
    const topFrontRight = new Box3(new Vector3(middleX, middleY, middleZ), new Vector3(max.x, max.y, max.z));
    this.topFrontRight = new Octree(topFrontRight, this.capacity);
    const bottomFrontRight = new Box3(new Vector3(middleX, min.y, middleZ), new Vector3(max.x, middleY, max.z));
    this.bottomFrontRight = new Octree(bottomFrontRight, this.capacity);

    this.divided = true;
  }

  insert(node) {
    if (!this.boundary.containsPoint(node.position)) return false;
    if (this.nodes.length < this.capacity) {
      this.nodes.push(node);
      return true;
    }
    if (!this.divided) this.subdivide();
    return (
      this.bottomBackLeft.insert(node)
      || this.topBackLeft.insert(node)
      || this.topFrontLeft.insert(node)
      || this.bottomFrontLeft.insert(node)
      || this.bottomBackRight.insert(node)
      || this.topBackRight.insert(node)
      || this.topFrontRight.insert(node)
      || this.bottomFrontRight.insert(node)
    );
  }

  query(searchArea, found) {
    // eslint-disable-next-line no-param-reassign
    if (!found) found = [];
    if (!this.boundary.intersectsBox(searchArea)) return found;
    if (searchArea.containsBox(this.boundary)) {
      // all points of this octree are within the search area
      this.nodes.forEach((node) => found.push(node));
    } else {
      // only part of this octree is contained in the search area
      this.nodes.forEach((node) => {
        if (searchArea.containsPoint(node.position)) found.push(node);
      });
    }
    if (this.divided) {
      this.bottomBackLeft.query(searchArea, found);
      this.topBackLeft.query(searchArea, found);
      this.topFrontLeft.query(searchArea, found);
      this.bottomFrontLeft.query(searchArea, found);
      this.bottomBackRight.query(searchArea, found);
      this.topBackRight.query(searchArea, found);
      this.topFrontRight.query(searchArea, found);
      this.bottomFrontRight.query(searchArea, found);
    }
    return found;
  }

  empty() {
    this.nodes = [];
    this.divided = false;
    this.bottomBackLeft = undefined;
    this.topBackLeft = undefined;
    this.topFrontLeft = undefined;
    this.bottomFrontLeft = undefined;
    this.bottomBackRight = undefined;
    this.topBackRight = undefined;
    this.topFrontRight = undefined;
    this.bottomFrontRight = undefined;
  }

  getBox() {
    const {max, min} = this.boundary;
    const width = max.x - min.x;
    const height = max.y - min.y;
    const depth = max.z - min.z;
    const middleX = (min.x + max.x) / 2;
    const middleY = (min.y + max.y) / 2;
    const middleZ = (min.z + max.z) / 2;
    const geometry = new BoxGeometry(width, height, depth);

    const edges = new EdgesGeometry(geometry);
    const box = new LineSegments(edges, new LineBasicMaterial({ color: 0xff0000f }));
    box.position.set(middleX, middleY, middleZ);
    return box;
  }
}

export default Octree;
