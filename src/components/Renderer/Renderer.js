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
  setSelectedNodes, setSelectedEdges, setNodesAndEdges, setAveragePositionPlaceholder
} from '../../redux/networkElements/networkElements.actions';
import {setOrbitPreview, addToActionHistory} from '../../redux/settings/settings.actions';
import {calculateAveragePosition, RGBtoHex} from '../utility';
import * as testNodes from '../../data/movies/nodes.json';
import * as testEdges from '../../data/movies/edges.json';

import './Renderer.scss';

let animationRunning = false;
const sensitivity = 0.002;
const controlKeys = ['w', 'a', 's', 'd', 'f', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'c', ' ', 'escape'];
let speed = 1;
const initialCameraZ = 200;
const hoverElementOutlineColor = '#aaaaaa';
const selectedElementOutlineColor = '#ff0000';

const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2(0, 0);
let hoveredElementOutline;
let selectedElementOutline;

const clock = new THREE.Clock();
let targetQuaternion;
let interpolation = 0;
let nodePositionChanges = [];

const useTestNetwork = true;

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
    this.lookAt = this.lookAt.bind(this);
    this.cameraControls = this.cameraControls.bind(this);
    this.handleOutline = this.handleOutline.bind(this);
    this.handleNodeDragging = this.handleNodeDragging.bind(this);
    this.handleControls = this.handleControls.bind(this);
    this.updateSceneElements = this.updateSceneElements.bind(this);
  }

  componentDidMount() {
    this.createScene();
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    const {updateScene, selectedNodes, selectedEdges} = this.props;
    const {scene} = this.state;
    this.handleControls(selectedNodes, selectedEdges);
    if (updateScene) {
      const network = scene.children.find((child) => child.name === 'Network');
      scene.remove(network);
      this.updateSceneElements();
    }
  }

  handleClickOnElement(e, connectedSelect = false) {
    const {
      nodes, edges, selectedNodes, selectedEdges, averagePositionPlaceholder, _setAveragePositionPlaceholder
    } = this.props;
    const {hoveredElement, controls, scene} = this.state;
    let newSelectedEdges = [...selectedEdges];
    let newSelectedNodes = [...selectedNodes];
    if (!controls.dragging) {
      if (hoveredElement.type === 'Group') {
        const newSelectedEdge = edges.find((edge) => edge.instance.uuid === hoveredElement.uuid);
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
        } else {
          scene.remove(averagePositionPlaceholder);
          _setAveragePositionPlaceholder(undefined);
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
    const {hoveredElement} = this.state;
    if (orbitPreview) {
      _setOrbitPreview(false);
    }
    targetQuaternion = undefined;
    interpolation = 0;
    if (hoveredElement) {
      if (e.button === 0) {
        const [newSelectedNodes, newSelectedEdges] = this.handleClickOnElement(e);
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
    const {selectedNodes, _addToActionHistory} = this.props;
    if (nodePositionChanges.length > 0) {
      selectedNodes.forEach((node, index) => {
        nodePositionChanges[index].setPositionAbsolute.after = node.instance.position.clone();
      });
      _addToActionHistory(nodePositionChanges);
      nodePositionChanges = [];
    }
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
    const {scene} = this.state;
    const {
      _setSelectedNodes, _setSelectedEdges, selectedNodes, selectedEdges, averagePositionPlaceholder,
      _setAveragePositionPlaceholder
    } = this.props;
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
          case 'f':
            this.lookAt([...selectedNodes, ...selectedEdges]);
            return prevState;
          case 'escape':
            scene.remove(averagePositionPlaceholder);
            _setAveragePositionPlaceholder(undefined);
            _setSelectedNodes([]);
            _setSelectedEdges([]);
            return prevState;
          default:
            return prevState;
        }
      });
    }
  }

  handleOutline() {
    const {hoveredElement} = this.state;
    const {selectedNodes, selectedEdges} = this.props;
    if (hoveredElement) {
      hoveredElementOutline.selectedObjects = hoveredElement.type === 'Group' ? hoveredElement.children : [hoveredElement.object];
    } else {
      hoveredElementOutline.selectedObjects = [];
    }
    if (selectedNodes.length || selectedEdges.length) {
      const selectedElements = [...selectedNodes, ...selectedEdges];
      selectedElementOutline.selectedObjects = selectedElements.map((selectedElement) => selectedElement.instance);
    } else {
      selectedElementOutline.selectedObjects = [];
    }
  }

  handleControls(newSelectedNodes, newSelectedEdges) {
    const {averagePositionPlaceholder, _setAveragePositionPlaceholder} = this.props;
    const {controls, scene} = this.state;
    if (newSelectedEdges.length || newSelectedNodes.length === 0) {
      controls.detach();
    } else if (newSelectedNodes.length === 1) {
      controls.attach(newSelectedNodes[0].instance);
    } else if (
      newSelectedNodes.length > 1
      && (!averagePositionPlaceholder || Object.keys(averagePositionPlaceholder.userData).length !== newSelectedNodes.length)
    ) {
      scene.remove(averagePositionPlaceholder);
      const newPlaceholder = new THREE.Object3D();
      const averagePosition = calculateAveragePosition(newSelectedNodes);
      newPlaceholder.position.set(averagePosition.x, averagePosition.y, averagePosition.z);
      newSelectedNodes.forEach((node) => {
        newPlaceholder.userData[node.id] = averagePosition.clone().sub(node.instance.position);
      });
      scene.add(newPlaceholder);
      controls.attach(newPlaceholder);
      _setAveragePositionPlaceholder(newPlaceholder);
    }
  }

  handleNodeDragging() {
    const {controls} = this.state;
    const {selectedNodes, averagePositionPlaceholder} = this.props;
    if (controls.dragging && selectedNodes.length) {
      if (nodePositionChanges.length === 0) {
        selectedNodes.forEach((node) => {
          const elementChanges = {element: node};
          elementChanges.setPositionAbsolute = {before: node.instance.position.clone()};
          nodePositionChanges.push(elementChanges);
        });
      }
      if (selectedNodes.length > 1) {
        selectedNodes.forEach((node) => {
          const newPosition = averagePositionPlaceholder.position.clone().sub(averagePositionPlaceholder.userData[node.id]);
          node.setPositionAbsolute(newPosition);
        });
      } else {
        selectedNodes[0].updateAssociatedEdgePosition();
      }
    }
  }

  updateSceneElements() {
    const {scene, camera} = this.state;
    const {
      nodes: serializedNodes, edges: serializedEdges, _setNodesAndEdges
    } = this.props;
    const nodes = serializedNodes.map((node) => {
      const nodeClass = new Node(
        node.position.x,
        node.position.y,
        node.position.z,
        node.size,
        node.color,
        node.id,
        node.labelText,
        node.data,
        node.colorLocked,
        node.shape,
        node.pathMap,
        camera
      );
      scene.add(nodeClass.instance);
      return nodeClass;
    });
    const edges = serializedEdges.map((edge) => {
      const sourceNode = nodes.filter((node) => node.id === edge.sourceNode)[0];
      const targetNode = nodes.filter((node) => node.id === edge.targetNode)[0];
      const edgeClass = new Edge(edge.id, sourceNode, targetNode, edge.size, edge.color);
      sourceNode.addSourceEdge(edgeClass);
      targetNode.addTargetEdge(edgeClass);
      scene.add(edgeClass.instance);
      return edgeClass;
    });
    nodes.forEach((node) => node.unserializePathMap(nodes));
    _setNodesAndEdges(nodes, edges, false);
  }

  lookAt(elements) {
    const {camera} = this.state;
    if (elements.length) {
      const position = new THREE.Vector3();
      interpolation = 0;
      elements.forEach((element) => {
        position.add(element.instance.position);
      });
      position.divideScalar(elements.length);
      const rotationMatrix = new THREE.Matrix4().lookAt(camera.position, position, camera.up);
      targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromRotationMatrix(rotationMatrix);
    }
  }

  cameraControls() {
    const {
      camera, cameraForward, cameraBack, cameraLeft, cameraRight, cameraUp, cameraDown
    } = this.state;
    const delta = clock.getDelta();
    if (targetQuaternion) {
      camera.quaternion.slerp(targetQuaternion, delta * 5);
      if (interpolation >= 1) {
        interpolation = 0;
        targetQuaternion = undefined;
      } else {
        interpolation += delta;
      }
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
  }

  checkIntersect(e) {
    const {camera, scene, hoveredElement} = this.state;
    const {clientX, clientY} = e;
    mousePosition.x = (clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    let newHoveredElement;
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length) {
      newHoveredElement = intersects.find(
        (intersectedElement) => (
          intersectedElement?.object.name === 'Node'
          || intersectedElement?.object.name === 'Edge'
          || intersectedElement?.object.name === 'Arrow'
        )
      );
      if (newHoveredElement && (newHoveredElement?.object.name === 'Edge' || newHoveredElement?.object.name === 'Arrow')) {
        newHoveredElement = newHoveredElement.object.parent;
      }
    }
    if (newHoveredElement !== hoveredElement) {
      this.setState((state) => ({
        ...state,
        hoveredElement: newHoveredElement
      }));
    }
  }

  createScene() {
    const {
      _setNodesAndEdges, remoteNodes, remoteEdges, use2Dimensions
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

    const networkElements = new THREE.Group();
    networkElements.name = 'Network';
    let nodes = [];
    let edges = [];
    if (useTestNetwork) {
      nodes = testNodes.default.map((node, index) => {
        const nodeClass = new Node(
          Math.random() * 50 - 25,
          Math.random() * 50 - 25,
          use2Dimensions ? 0 : Math.random() * 50 - 25,
          1,
          RGBtoHex([Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255)]),
          index,
          node.label,
          node.data,
          false,
          'Sphere',
          undefined,
          camera
        );
        networkElements.add(nodeClass.instance);
        return nodeClass;
      });
      edges = testEdges.default.map((edge, index) => {
        const sourceNode = nodes.filter((node) => node.labelText === edge.source)[0];
        const targetNode = nodes.filter((node) => node.labelText === edge.target)[0];
        const edgeClass = new Edge(index, sourceNode, targetNode, 1, '#ffffff');
        sourceNode.addSourceEdge(edgeClass);
        targetNode.addTargetEdge(edgeClass);
        networkElements.add(edgeClass.instance);
        return edgeClass;
      });
    } else {
      nodes = remoteNodes.map((node, index) => {
        const nodeClass = new Node(
          Math.random() * 50 - 25,
          Math.random() * 50 - 25,
          use2Dimensions ? 0 : Math.random() * 50 - 25,
          1,
          new THREE.Color(Math.random(), Math.random(), Math.random()),
          index,
          node.label,
          node.data,
          false,
          'Sphere',
          undefined,
          camera
        );
        networkElements.add(nodeClass.instance);
        return nodeClass;
      });
      edges = remoteEdges.map((edge, index) => {
        const sourceNode = nodes.filter((node) => node.labelText === edge.source)[0];
        const targetNode = nodes.filter((node) => node.labelText === edge.target)[0];
        const edgeClass = new Edge(index, sourceNode, targetNode, 1, '#ffffff');
        sourceNode.addSourceEdge(edgeClass);
        targetNode.addTargetEdge(edgeClass);
        networkElements.add(edgeClass.instance);
        return edgeClass;
      });
    }
    scene.add(networkElements);
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

    _setNodesAndEdges(nodes, edges, false);
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
    const {composer, scene, camera} = this.state;
    const {orbitPreview, nodes} = this.props;
    requestAnimationFrame(this.animate);
    if (orbitPreview) {
      camera.position.x = camera.position.x * Math.cos(0.002) - camera.position.z * Math.sin(0.002);
      camera.position.z = camera.position.z * Math.cos(0.002) + camera.position.x * Math.sin(0.002);
      camera.lookAt(scene.position);
    }
    this.cameraControls();
    this.handleOutline();
    this.handleNodeDragging();
    nodes.forEach((node) => {
      if (node.label) {
        node.updateLabelPosition(camera);
      }
    });
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
  updateScene: state.networkElements.updateScene,
  selectedNodes: state.networkElements.selectedNodes,
  selectedEdges: state.networkElements.selectedEdges,
  averagePositionPlaceholder: state.networkElements.averagePositionPlaceholder
});

const mapDispatchToProps = (dispatch) => ({
  _setOrbitPreview: (state) => dispatch(setOrbitPreview(state)),
  _addToActionHistory: (positionChanges) => dispatch(addToActionHistory(positionChanges)),
  _setNodesAndEdges: (nodes, edges, shouldUpdateScene) => dispatch(setNodesAndEdges(nodes, edges, shouldUpdateScene)),
  _setSelectedNodes: (nodes) => dispatch(setSelectedNodes(nodes)),
  _setSelectedEdges: (edges) => dispatch(setSelectedEdges(edges)),
  _setAveragePositionPlaceholder: (placeholder) => dispatch(setAveragePositionPlaceholder(placeholder))
});

export default connect(mapStateToPros, mapDispatchToProps)(memo(Renderer));
