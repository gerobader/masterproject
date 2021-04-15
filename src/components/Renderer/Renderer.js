import React, {Component, createRef} from 'react';
import * as THREE from 'three';
import getCube from './Elements/cube';

import './Renderer.scss';

let animationRunning = false;

class Renderer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: undefined,
      camera: undefined,
      renderer: undefined,
      cube: undefined
    };
    this.canvasWrapper = createRef();
    this.createScene = this.createScene.bind(this);
    this.animate = this.animate.bind(this);
  }

  componentDidMount() {
    this.createScene();
  }

  createScene() {
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvasWrapper.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
    const cube = getCube();
    scene.add(cube);

    this.setState((state) => ({
      ...state,
      renderer,
      scene,
      camera,
      cube
    }));
  }

  animate() {
    const {
      renderer, scene, camera, cube
    } = this.state;
    const {count} = this.props;
    requestAnimationFrame(this.animate);
    cube.position.x = count;
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  render() {
    const {renderer} = this.state;
    if (renderer && !animationRunning) {
      animationRunning = true;
      this.animate();
    }
    // eslint-disable-next-line no-return-assign
    return <div className="renderer" ref={(ref) => (this.canvasWrapper = ref)}/>;
  }
}

export default React.memo(Renderer);
