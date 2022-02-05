/* eslint-disable */
import React, {Component, createRef, memo} from 'react';
import {connect} from 'react-redux';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass';
import Node from './Elements/Node';
import Edge from './Elements/Edge';
import {setOrbitPreview} from '../../redux/settings/settings.actions';
import * as lesMiserablesNodes from '../../data/LesMiserables/nodes.json';
import * as lesMiserablesEdges from '../../data/LesMiserables/edges.json';

import './Renderer.scss';

let animationRunning = false;
const sensitivity = 0.002;
const controlKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'c', ' ', 'escape'];
let speed = 1;
const initialCameraZ = 200;
const hoverElementOutlineColor = '#aaaaaa';
const selectedElementOutlineColor = '#ffffff';

const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2(0, 0);
let hoveredElementOutline;
let selectedElementOutline;

class Renderer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
      edges: [],
      scene: undefined,
      camera: undefined,
      renderer: undefined,
      composer: undefined,
      hoveredElement: [],
      selectedElements: [],
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

  checkIntersect(e) {
    const {camera, scene} = this.state;
    const {clientX, clientY} = e;
    mousePosition.x = (clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    const newHoveredElement = raycaster.intersectObjects(scene.children);
    this.setState((state) => ({
      ...state,
      hoveredElement: newHoveredElement
    }));
  }


  handleClickOnElement(e) {
    const {hoveredElement, selectedElements, nodes, edges} = this.state;
    let newSelectedElements = [...selectedElements];
    if (hoveredElement.length) {
      let newElement;
      if (hoveredElement[0].object.geometry.type === 'CylinderGeometry') {
        newElement = edges.find((edge) => edge.instance.uuid === hoveredElement[0].object.uuid);
      } else {
        newElement = nodes.find((node) => node.instance.uuid === hoveredElement[0].object.uuid);
      }
      if (e.ctrlKey) {
        if (selectedElements.includes(newElement)) {
          newSelectedElements = selectedElements.filter((element) => element !== newElement);
        } else {
          newSelectedElements = [...selectedElements, newElement];
        }
      } else {
        newSelectedElements = [newElement];
      }
    }
    return newSelectedElements;
  }

  handleMouseDown(e) {
    e.preventDefault();
    const {_setOrbitPreview} = this.props;
    _setOrbitPreview(false);
    const newSelectedElements = this.handleClickOnElement(e);
    this.setState((prevState) => ({
      ...prevState,
      mouseDown: true,
      selectedElements: newSelectedElements
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
    this.checkIntersect(e);
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
          case 'arrowup':
          case 'w':
            return {
              ...prevState,
              cameraForward: true
            };
          case 'arrowdown':
          case 's':
            return {
              ...prevState,
              cameraBack: true
            };
          case 'arrowleft':
          case 'a':
            return {
              ...prevState,
              cameraLeft: true
            };
          case 'arrowright':
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
          case 'arrowup':
          case 'w':
            return {
              ...prevState,
              cameraForward: false
            };
          case 'arrowdown':
          case 's':
            return {
              ...prevState,
              cameraBack: false
            };
          case 'arrowleft':
          case 'a':
            return {
              ...prevState,
              cameraLeft: false
            };
          case 'arrowright':
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
          case 'escape':
            return {
              ...prevState,
              selectedElements: []
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

    window.addEventListener('keydown', this.handleKeyPress);
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

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    hoveredElementOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    hoveredElementOutline.visibleEdgeColor.set(hoverElementOutlineColor);
    composer.addPass(hoveredElementOutline);
    selectedElementOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    selectedElementOutline.visibleEdgeColor.set(selectedElementOutlineColor);
    composer.addPass(selectedElementOutline);

    this.setState((state) => ({
      ...state,
      nodes,
      edges,
      renderer,
      composer,
      scene,
      camera
    }));
  }

  animate() {
    const {
      composer, hoveredElement, selectedElements, scene, nodes, camera, cameraForward, cameraBack, cameraLeft, cameraRight, cameraUp, cameraDown
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
    if (hoveredElement.length) {
      hoveredElementOutline.selectedObjects = [hoveredElement[0].object];
    } else {
      hoveredElementOutline.selectedObjects = [];
    }
    if (selectedElements.length) {
      selectedElementOutline.selectedObjects = selectedElements.map((selectedElement) => selectedElement.instance);
    } else {
      selectedElementOutline.selectedObjects = [];
    }

    composer.render();
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
