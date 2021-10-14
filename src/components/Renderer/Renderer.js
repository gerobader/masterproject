import React, {Component, createRef, memo} from 'react';
import {connect} from 'react-redux';
import * as THREE from 'three';
import Node from './Elements/Node';
import Edge from './Elements/Edge';
import {setOrbitPreview} from '../../redux/settings/settings.actions';
import * as lesMiserablesNodes from '../../data/LesMiserables/nodes.json';
import * as lesMiserablesEdges from '../../data/LesMiserables/edges.json';

import './Renderer.scss';

let animationRunning = false;
const sensitivity = 0.002;
const controlKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'c', ' '];
let speed = 1;
const initialCameraZ = 300;

class Renderer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      edges: [],
      scene: undefined,
      camera: undefined,
      renderer: undefined,
      mouseDown: false,
      cameraForward: false,
      cameraLeft: false,
      cameraRight: false,
      cameraBack: false,
      cameraUp: false,
      cameraDown: false
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
    const {_setOrbitPreview} = this.props;
    _setOrbitPreview(false);
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
    if (controlKeys.includes(key)) {
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
          case ' ':
            return {
              ...prevState,
              cameraUp: true
            };
          case 'c':
            return {
              ...prevState,
              cameraDown: true
            };
          default:
            return prevState;
        }
      });
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (controlKeys.includes(key)) {
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
          case ' ':
            return {
              ...prevState,
              cameraUp: false
            };
          case 'c':
            return {
              ...prevState,
              cameraDown: false
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
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.rotation.order = 'YXZ';
    camera.position.z = initialCameraZ;

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    window.addEventListener('keypress', this.handleKeyPress);
    window.addEventListener('keyup', this.handleKeyUp);

    const nodes = lesMiserablesNodes.default.map((node) => {
      const nodeClass = new Node(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        1,
        new THREE.Color(Math.random(), Math.random(), Math.random()),
        node.id,
        node.label,
        camera
      );
      scene.add(nodeClass.instance);
      return nodeClass;
    });

    const edges = lesMiserablesEdges.default.map((edge) => {
      const sourceNode = nodes.filter((node) => node.id === edge.source);
      const targetNode = nodes.filter((node) => node.id === edge.target);
      const edgeClass = new Edge(sourceNode[0], targetNode[0]);
      scene.add(edgeClass.instance);
      return edgeClass;
    });

    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -10, 0),
      new THREE.Vector3(0, 10, 0)
    ]);
    scene.add(new THREE.Line(geometry, material));
    const geometrytwo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-10, 0, 0),
      new THREE.Vector3(10, 0, 0)
    ]);
    scene.add(new THREE.Line(geometrytwo, material));
    const geometrythree = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -10),
      new THREE.Vector3(0, 0, 10)
    ]);
    scene.add(new THREE.Line(geometrythree, material));
    this.setState((state) => ({
      ...state,
      nodes,
      edges,
      renderer,
      scene,
      camera
    }));
  }

  animate() {
    const {
      renderer, scene, nodes, camera, cameraForward, cameraBack, cameraLeft, cameraRight, cameraUp, cameraDown
    } = this.state;
    const {orbitPreview} = this.props;
    requestAnimationFrame(this.animate);
    if (orbitPreview) {
      camera.position.x = camera.position.x * Math.cos(0.002) - camera.position.z * Math.sin(0.002);
      camera.position.z = camera.position.z * Math.cos(0.002) + camera.position.x * Math.sin(0.002);
      camera.lookAt(scene.position);
    }
    if (cameraForward || cameraBack || cameraLeft || cameraRight || cameraUp || cameraDown) {
      speed += 0.1;
      const dir = new THREE.Vector3(0, 0, 0);
      if (cameraForward) dir.z -= 1;
      if (cameraBack) dir.z += 1;
      if (cameraLeft) dir.x -= 1;
      if (cameraRight) dir.x += 1;
      if (cameraUp) dir.y += 1;
      if (cameraDown) dir.y -= 1;
      dir.applyQuaternion(camera.quaternion).normalize();
      const divideVector = new THREE.Vector3(10 / speed, 10 / speed, 10 / speed);
      camera.position.add(dir.divide(divideVector));
    } else {
      speed = 1;
    }

    nodes.forEach((node) => {
      if (node.label) {
        node.updateLabelPosition(camera);
      }
    });
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
        id="network-view"
        className={`renderer${mouseDown ? ' hide-cursor' : ''}`}
        ref={(ref) => (this.canvasWrapper = ref)}
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
      />
    );
  }
}

const mapStateToPros = (state) => ({
  orbitPreview: state.settings.orbitPreview
});

const mapDispatchToProps = (dispatch) => ({
  _setOrbitPreview: (state) => dispatch(setOrbitPreview(state))
});

export default connect(mapStateToPros, mapDispatchToProps)(memo(Renderer));
