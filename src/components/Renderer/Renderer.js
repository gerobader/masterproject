import React, {Component, createRef} from 'react';
import * as THREE from 'three';
import getCube from './Elements/cube';
import Sphere from './Elements/Sphere';
// import Line from './Elements/Line';
import arcticData from '../../data/arctic.json';

import './Renderer.scss';

let animationRunning = false;
const sensitivity = 0.002;
const controllKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
let speed = 1;

class Renderer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: undefined,
      camera: undefined,
      renderer: undefined,
      cube: undefined,
      mouseDown: false,
      cameraForward: false,
      cameraLeft: false,
      cameraRight: false,
      cameraBack: false
    };
    this.canvasWrapper = createRef();
    this.createScene = this.createScene.bind(this);
    this.animate = this.animate.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  componentDidMount() {
    this.createScene();
  }

  handleMouseDown(e) {
    e.preventDefault();
    this.setState((prevState) => ({
      ...prevState,
      mouseDown: true
    }));
  }

  handleMouseUp() {
    this.setState((prevState) => ({
      ...prevState,
      mouseDown: false
    }));
  }

  handleMouseMove(e) {
    const {mouseDown, camera} = this.state;
    if (!mouseDown) return;
    if (e.buttons === 1) {
      camera.rotation.y -= e.movementX * sensitivity;
      camera.rotation.x -= e.movementY * sensitivity;
    }
  }

  handleKeyPress(e) {
    const key = e.key.toLowerCase();
    if (controllKeys.includes(key)) {
      this.setState((prevState) => {
        switch (key) {
          case 'ArrowUp':
          case 'w':
            return {
              ...prevState,
              cameraForward: true
            };
          case 'ArrowDown':
          case 's':
            return {
              ...prevState,
              cameraBack: true
            };
          case 'ArrowLeft':
          case 'a':
            return {
              ...prevState,
              cameraLeft: true
            };
          case 'ArrowRight':
          case 'd':
            return {
              ...prevState,
              cameraRight: true
            };
          default:
            return prevState;
        }
      });
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (controllKeys.includes(key)) {
      this.setState((prevState) => {
        switch (key) {
          case 'ArrowUp':
          case 'w':
            return {
              ...prevState,
              cameraForward: false
            };
          case 'ArrowDown':
          case 's':
            return {
              ...prevState,
              cameraBack: false
            };
          case 'ArrowLeft':
          case 'a':
            return {
              ...prevState,
              cameraLeft: false
            };
          case 'ArrowRight':
          case 'd':
            return {
              ...prevState,
              cameraRight: false
            };
          default:
            return prevState;
        }
      });
    }
  }

  createScene() {
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvasWrapper.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.rotation.order = 'YXZ';
    camera.position.z = 10;

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    window.addEventListener('keypress', this.handleKeyPress);
    window.addEventListener('keyup', this.handleKeyUp);

    arcticData.nodes.forEach((node) => {
      scene.add(Sphere(node.x / 100, node.y / 100, 0, Math.random() / 2));
    });

    // arcticData.edges.forEach((edge) => {
    //   const startNode = arcticData.nodes[edge.source];
    //   const endNode = arcticData.nodes[edge.target];
    //   if (!startNode || !endNode) return;
    //   scene.add(Line(
    //     {
    //       x: startNode.x,
    //       y: startNode.y,
    //       z: 0
    //     },
    //     {
    //       x: endNode.x,
    //       y: endNode.y,
    //       z: 0
    //     }
    //   ));
    // });

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
      renderer, scene, camera, cube, cameraForward, cameraBack, cameraLeft, cameraRight
    } = this.state;
    const {count} = this.props;
    requestAnimationFrame(this.animate);
    if (cameraForward || cameraBack || cameraLeft || cameraRight) {
      speed += 0.05;
      const dir = new THREE.Vector3(0, 0, 0);
      if (cameraForward) dir.z -= 1;
      if (cameraBack) dir.z += 1;
      if (cameraLeft) dir.x -= 1;
      if (cameraRight) dir.x += 1;
      dir.applyQuaternion(camera.quaternion).normalize();
      const divideVector = new THREE.Vector3(10 / speed, 10 / speed, 10 / speed);
      camera.position.add(dir.divide(divideVector));
    } else {
      speed = 1;
    }
    cube.position.x = count;
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  render() {
    const {renderer, mouseDown} = this.state;
    if (renderer && !animationRunning) {
      animationRunning = true;
      this.animate();
    }
    return (
      <div
        className={`renderer${mouseDown ? ' hide-cursor' : ''}`}
        ref={(ref) => (this.canvasWrapper = ref)}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
      />
    );
  }
}

export default React.memo(Renderer);
