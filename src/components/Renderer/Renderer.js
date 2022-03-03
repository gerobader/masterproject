import React, {Component, createRef, memo} from 'react';
import {connect} from 'react-redux';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass';
import {TransformControls} from 'three/examples/jsm/controls/TransformControls';
import Node from './Elements/Node';
import Edge from './Elements/Edge';
import {
  setNodes, setEdges, setSelectedNodes, setSelectedEdges
} from '../../redux/networkElements/networkElements.actions';
import {setOrbitPreview} from '../../redux/settings/settings.actions';
import * as testNodes from '../../data/LesMiserables/nodes.json';
import * as testEdges from '../../data/LesMiserables/edges.json';

import './Renderer.scss';

let animationRunning = false;
const sensitivity = 0.002;
const controlKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'c', ' ', 'escape'];
let speed = 1;
const initialCameraZ = 200;
const hoverElementOutlineColor = '#aaaaaa';
const selectedElementOutlineColor = '#ff0000';

const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2(0, 0);
let hoveredElementOutline;
let selectedElementOutline;

let group;

const useTestNetwork = true;

let lastTimestamp = false;
let calculatePositions = false;

class Renderer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scene: undefined,
      camera: undefined,
      renderer: undefined,
      composer: undefined,
      controls: undefined,
      hoveredElement: undefined,
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

  handleClickOnElement(e, connectedSelect = false) {
    const {
      nodes, edges, selectedNodes, selectedEdges
    } = this.props;
    const {hoveredElement, controls, scene} = this.state;
    let newSelectedEdges = [...selectedEdges];
    let newSelectedNodes = [...selectedNodes];
    if (!controls.dragging) {
      if (hoveredElement.object.name === 'Edge') {
        const newSelectedEdge = edges.find((edge) => edge.instance.uuid === hoveredElement.object.uuid);
        if (e.ctrlKey && !connectedSelect) {
          if (selectedEdges.includes(newSelectedEdge)) {
            newSelectedEdges = selectedEdges.filter((edge) => edge !== newSelectedEdge);
          } else {
            newSelectedEdges = [...selectedEdges, newSelectedEdge];
          }
        } else {
          newSelectedNodes = [];
          newSelectedEdges = [newSelectedEdge];
        }
      } else {
        const newSelectedNode = nodes.find((node) => node.instance.uuid === hoveredElement.object.uuid);
        if (e.ctrlKey && !connectedSelect) {
          if (selectedNodes.includes(newSelectedNode)) {
            newSelectedNodes = selectedNodes.filter((edge) => edge !== newSelectedNode);
          } else {
            newSelectedNodes = [...selectedNodes, newSelectedNode];
          }
          if (newSelectedNodes.length === 1) controls.attach(newSelectedNode.instance);
        } else {
          scene.remove(group);
          if (!connectedSelect) controls.attach(newSelectedNode.instance);
          else controls.detach();
          newSelectedNodes = [newSelectedNode];
          newSelectedEdges = [];
        }
      }
    }
    return [newSelectedNodes, newSelectedEdges];
  }

  handleMouseDown(e) {
    e.preventDefault();
    const {
      _setOrbitPreview, orbitPreview, _setSelectedNodes, _setSelectedEdges
    } = this.props;
    const {scene, controls, hoveredElement} = this.state;
    if (orbitPreview) {
      _setOrbitPreview(false);
    }
    if (hoveredElement) {
      if (e.button === 0) {
        const [newSelectedNodes, newSelectedEdges] = this.handleClickOnElement(e);
        if (newSelectedEdges.length) {
          controls.detach();
        } else if (newSelectedNodes.length > 1 && (!group || group.children.length !== newSelectedNodes.length)) {
          scene.remove(group);
          group = new THREE.Group();
          const groupPosition = new THREE.Vector3(0, 0, 0);
          newSelectedNodes.forEach((node) => {
            groupPosition.add(node.instance.position);
          });
          groupPosition.divideScalar(newSelectedNodes.length);
          group.position.set(groupPosition.x, groupPosition.y, groupPosition.z);
          newSelectedNodes.forEach((node) => {
            const clone = node.instance.clone();
            clone.userData = {originalUuid: node.instance.uuid};
            clone.position.sub(groupPosition);
            group.add(clone);
          });
          scene.add(group);
          controls.attach(group);
        }
        _setSelectedNodes(newSelectedNodes);
        _setSelectedEdges(newSelectedEdges);
      } else if (e.button === 1) {
        const [selectedNodes, selectedEdges] = this.handleClickOnElement(e, true);
        let newSelectedNodes = [];
        let newSelectedEdges = [];
        if (selectedNodes.length) {
          newSelectedNodes = selectedNodes;
          newSelectedEdges = [
            ...selectedNodes[0].targetForEdges,
            ...selectedNodes[0].sourceForEdges
          ];
        } else if (selectedEdges.length) {
          newSelectedEdges = selectedEdges;
          newSelectedNodes = [selectedEdges[0].sourceNode, selectedEdges[0].targetNode];
        }
        _setSelectedNodes(newSelectedNodes);
        _setSelectedEdges(newSelectedEdges);
      }
    }
    this.setState((prevState) => ({
      ...prevState,
      mouseDown: e.buttons === 1
    }));
  }

  handleMouseUp() {
    this.setState((prevState) => ({
      ...prevState,
      mouseDown: false
    }));
  }

  handleMouseMove(e) {
    const {mouseDown, camera, controls} = this.state;
    this.checkIntersect(e);
    if (!mouseDown || controls.dragging) return;
    camera.rotation.y -= e.movementX * sensitivity;
    camera.rotation.x -= e.movementY * sensitivity;
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
    const {scene, controls} = this.state;
    const {_setSelectedNodes, _setSelectedEdges} = this.props;
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
            controls.detach();
            scene.remove(group);
            group = undefined;
            _setSelectedNodes([]);
            _setSelectedEdges([]);
            calculatePositions = false;
            return prevState;
          default:
            return prevState;
        }
      });
    }
  }

  checkIntersect(e) {
    const {camera, scene, hoveredElement} = this.state;
    const {clientX, clientY} = e;
    mousePosition.x = (clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    let newHoveredElement = raycaster.intersectObjects(scene.children);
    newHoveredElement = newHoveredElement.length ? newHoveredElement[0] : undefined;
    if (newHoveredElement !== hoveredElement) {
      this.setState((state) => ({
        ...state,
        hoveredElement: newHoveredElement
      }));
    }
  }

  createScene() {
    const {
      _setNodes, _setEdges, remoteNodes, remoteEdges
    } = this.props;
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvasWrapper.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    const lightTarget = new THREE.Object3D();
    lightTarget.position.set(-100, -100, -100);
    scene.add(lightTarget);
    directionalLight.castShadow = true;
    directionalLight.target = lightTarget;
    scene.add(directionalLight);
    camera.rotation.order = 'YXZ';
    camera.position.z = initialCameraZ;

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    window.addEventListener('keydown', this.handleKeyPress);
    window.addEventListener('keyup', this.handleKeyUp);

    let nodes = [];
    let edges = [];
    if (useTestNetwork) {
      nodes = testNodes.default.map((node) => {
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

      edges = testEdges.default.map((edge) => {
        const sourceNode = nodes.filter((node) => node.id === edge.source)[0];
        const targetNode = nodes.filter((node) => node.id === edge.target)[0];
        const edgeClass = new Edge(sourceNode, targetNode);
        sourceNode.addSourceEdge(edgeClass);
        targetNode.addTargetEdge(edgeClass);
        scene.add(edgeClass.instance);
        return edgeClass;
      });
    } else {
      nodes = remoteNodes.map((node, index) => {
        const nodeClass = new Node(
          Math.random() * 100 - 50,
          Math.random() * 100 - 50,
          Math.random() * 100 - 50,
          1,
          new THREE.Color(Math.random(), Math.random(), Math.random()),
          index,
          node.label,
          camera
        );
        scene.add(nodeClass.instance);
        return nodeClass;
      });

      edges = remoteEdges.map((edge) => {
        const sourceNode = nodes.filter((node) => node.labelText === edge.source)[0];
        const targetNode = nodes.filter((node) => node.labelText === edge.target)[0];
        const edgeClass = new Edge(sourceNode, targetNode);
        sourceNode.addSourceEdge(edgeClass);
        targetNode.addTargetEdge(edgeClass);
        scene.add(edgeClass.instance);
        return edgeClass;
      });
    }

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    hoveredElementOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    hoveredElementOutline.visibleEdgeColor.set(hoverElementOutlineColor);
    composer.addPass(hoveredElementOutline);
    selectedElementOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    selectedElementOutline.visibleEdgeColor.set(selectedElementOutlineColor);
    composer.addPass(selectedElementOutline);

    const controls = new TransformControls(camera, renderer.domElement);
    controls.setSize(0.5);
    scene.add(controls);

    _setNodes(nodes);
    _setEdges(edges);
    this.setState((state) => ({
      ...state,
      renderer,
      composer,
      scene,
      camera,
      controls
    }));
  }

  animate() {
    const {
      composer, hoveredElement, scene, camera, controls, cameraForward, cameraBack, cameraLeft, cameraRight, cameraUp, cameraDown
    } = this.state;
    const {
      orbitPreview, nodes, selectedNodes, selectedEdges
    } = this.props;
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
      if (calculatePositions && !selectedNodes.includes(node)) {
        node.calculatePosition(nodes);
      }
      if (node.label) {
        node.updateLabelPosition(camera);
      }
    });
    if (hoveredElement) {
      hoveredElementOutline.selectedObjects = [hoveredElement.object];
    } else {
      hoveredElementOutline.selectedObjects = [];
    }
    if (selectedNodes.length || selectedEdges.length) {
      const selectedElements = [...selectedNodes, ...selectedEdges];
      selectedElementOutline.selectedObjects = selectedElements.map((selectedElement) => selectedElement.instance);
    } else {
      selectedElementOutline.selectedObjects = [];
    }

    if (controls.dragging) {
      if (selectedNodes.length > 1) {
        group.children.forEach((nodeCopy) => {
          const original = selectedNodes.find((selectedNode) => selectedNode.instance.uuid === nodeCopy.userData.originalUuid);
          if (original) {
            const newPosition = new THREE.Vector3();
            nodeCopy.getWorldPosition(newPosition);
            original.setPositionAbsolute(newPosition.x, newPosition.y, newPosition.z);
          }
        });
      } else {
        selectedNodes[0].updateAssociatedEdgePosition();
      }
    }
    // const newTimestamp = new Date().valueOf();
    // let fps = 0;
    // if (lastTimestamp) {
    //   fps = 1000 / (newTimestamp - lastTimestamp);
    // }
    // lastTimestamp = newTimestamp;
    // console.log(fps);
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
  orbitPreview: state.settings.orbitPreview,
  nodes: state.networkElements.nodes,
  edges: state.networkElements.edges,
  selectedNodes: state.networkElements.selectedNodes,
  selectedEdges: state.networkElements.selectedEdges
});

const mapDispatchToProps = (dispatch) => ({
  _setOrbitPreview: (state) => dispatch(setOrbitPreview(state)),
  _setNodes: (nodes) => dispatch(setNodes(nodes)),
  _setEdges: (edges) => dispatch(setEdges(edges)),
  _setSelectedNodes: (nodes) => dispatch(setSelectedNodes(nodes)),
  _setSelectedEdges: (edges) => dispatch(setSelectedEdges(edges))
});

export default connect(mapStateToPros, mapDispatchToProps)(memo(Renderer));
