import React, {Component, createRef, memo} from 'react';
import {connect} from 'react-redux';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass';
import {TransformControls} from 'three/examples/jsm/controls/TransformControls';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Node from './Elements/Node';
import Nodes from './Elements/Nodes';
import Edge from './Elements/Edge';
import Edges from './Elements/Edges';
import BoundaryBox from './Elements/BoundaryBox';
import Octree from '../Overlay/Controls/Layout/Octree';
import {
  setSelectedNodes, setSelectedEdges, setNodesAndEdges, setAveragePositionPlaceholder, setDirected, setOctree
} from '../../redux/network/network.actions';
import {addToActionHistory, setCamera} from '../../redux/settings/settings.actions';
import {calculateAveragePosition} from '../utility';
import {initialCameraPosition, hoverElementOutlineColor, selectedElementOutlineColor} from '../constants';

import './Renderer.scss';

let scene;
let renderer;
let composer;
let controls;
let hoveredElement;
let networkElements = new THREE.Group();
let animationRunning = false;
let boundaryBox;
const controlKeys = ['f', 'escape'];
let cameraControls;
const octGroup = new THREE.Group();

const raycaster = new THREE.Raycaster();
const mousePosition = new THREE.Vector2(0, 0);
let hoveredElementOutline;
let selectedElementOutline;
const clock = new THREE.Clock();
let targetQuaternion;
let interpolation = 0;
let nodePositionChanges = [];

class Renderer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseDown: false
    };
    this.canvasWrapper = createRef();
    this.createScene = this.createScene.bind(this);
    this.animate = this.animate.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.lookAt = this.lookAt.bind(this);
    this.cameraControls = this.cameraControls.bind(this);
    this.handleOutline = this.handleOutline.bind(this);
    this.handleControls = this.handleControls.bind(this);
    this.updateSceneElements = this.updateSceneElements.bind(this);
  }

  componentDidMount() {
    this.createScene();
  }

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    const {
      updateScene, nodes, selectedNodes, selectedEdges, networkBoundarySize, showBoundary, boundaryOpacity
    } = this.props;
    this.handleControls(selectedNodes, selectedEdges);
    if (networkBoundarySize !== prevProps.networkBoundarySize && showBoundary) {
      boundaryBox.setSize(networkBoundarySize);
      nodes.forEach((node) => node.setNetworkBoundarySize(networkBoundarySize));
    }
    if (showBoundary !== prevProps.showBoundary) boundaryBox.setVisibility(showBoundary);
    if (boundaryOpacity !== prevProps.boundaryOpacity) boundaryBox.setOpacity(boundaryOpacity);
    if (updateScene) {
      const network = scene.children.find((child) => child.name === 'Network');
      scene.remove(network);
      this.updateSceneElements();
    }
  }

  handleClickOnElement(e, connectedSelect = false) {
    const {
      nodes, edges, selectedNodes, selectedEdges, averagePositionPlaceholder, _setAveragePositionPlaceholder, performanceMode
    } = this.props;
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
        let newSelectedNode;
        if (performanceMode) {
          newSelectedNode = hoveredElement;
        } else {
          newSelectedNode = nodes.find((node) => node.instance.uuid === hoveredElement.object.uuid);
        }
        if (e.ctrlKey && !connectedSelect) {
          if (selectedNodes.includes(newSelectedNode)) {
            newSelectedNodes = selectedNodes.filter((node) => node !== newSelectedNode);
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
    targetQuaternion = undefined;
    interpolation = 0;
    this.setState((prevState) => ({
      ...prevState,
      mouseDown: e.buttons === 1
    }));
  }

  handleMouseUp(e) {
    const {
      selectedNodes: currentlySelectedNodes, _addToActionHistory, _setSelectedNodes, _setSelectedEdges
    } = this.props;

    cameraControls.enabled = true;
    if (nodePositionChanges.length > 0 && nodePositionChanges.length === currentlySelectedNodes.length) {
      currentlySelectedNodes.forEach((node, index) => {
        nodePositionChanges[index].setPositionAbsolute.after = node.position.clone();
      });
      _addToActionHistory(nodePositionChanges);
      nodePositionChanges = [];
    }

    if (hoveredElement) {
      if (e.button === 0) {
        const [newSelectedNodes, newSelectedEdges] = this.handleClickOnElement(e);
        _setSelectedNodes(newSelectedNodes);
        _setSelectedEdges(newSelectedEdges);
      } else if (e.button === 1) {
        const [selectedNodes, selectedEdges] = this.handleClickOnElement(e, false);
        const newSelectedNodes = new Set();
        const newSelectedEdges = new Set();
        if (selectedNodes.length) {
          selectedNodes.forEach((node) => {
            newSelectedNodes.add(node);
            node.targetForEdges.forEach((edge) => {
              newSelectedEdges.add(edge);
              newSelectedNodes.add(edge.sourceNode);
            });
            node.sourceForEdges.forEach((edge) => {
              newSelectedEdges.add(edge);
              newSelectedNodes.add(edge.targetNode);
            });
          });
        } else if (selectedEdges.length) {
          selectedEdges.forEach((edge) => {
            newSelectedEdges.add(edge);
            newSelectedNodes.add(edge.sourceNode);
            newSelectedNodes.add(edge.targetNode);
          });
        }
        _setSelectedNodes([...newSelectedNodes]);
        _setSelectedEdges([...newSelectedEdges]);
      }
    }

    this.setState((prevState) => ({
      ...prevState,
      mouseDown: false
    }));
  }

  handleMouseMove(e) {
    const {selectedNodes, averagePositionPlaceholder} = this.props;
    this.checkIntersect(e);
    if (controls.dragging && selectedNodes.length) {
      cameraControls.enabled = false;
      if (nodePositionChanges.length === 0) {
        selectedNodes.forEach((node) => {
          const elementChanges = {element: node, type: 'graphElement'};
          elementChanges.setPositionAbsolute = {before: node.position.clone()};
          nodePositionChanges.push(elementChanges);
        });
      }
      if (selectedNodes.length) {
        selectedNodes.forEach((node) => {
          const newPosition = averagePositionPlaceholder.position.clone().sub(averagePositionPlaceholder.userData[node.id]);
          node.setPositionAbsolute(newPosition);
        });
      }
    }
  }

  handleKeyUp(e) {
    const {
      _setSelectedNodes, _setSelectedEdges, selectedNodes, selectedEdges, averagePositionPlaceholder,
      _setAveragePositionPlaceholder, _addToActionHistory, keyboardInputsBlocked
    } = this.props;
    const key = e.key.toLowerCase();
    if (controlKeys.includes(key) && !keyboardInputsBlocked) {
      this.setState((prevState) => {
        switch (key) {
          case 'f':
            this.lookAt([...selectedNodes, ...selectedEdges]);
            return prevState;
          case 'escape':
            if (nodePositionChanges.length > 0) {
              selectedNodes.forEach((node, index) => {
                nodePositionChanges[index].setPositionAbsolute.after = node.position.clone();
              });
              _addToActionHistory(nodePositionChanges);
              nodePositionChanges = [];
            }
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
    const {selectedNodes, selectedEdges, performanceMode} = this.props;
    if (hoveredElement) {
      hoveredElementOutline.selectedObjects = hoveredElement.type === 'Group' ? hoveredElement.children : [hoveredElement.object];
    } else {
      hoveredElementOutline.selectedObjects = [];
    }
    if ((selectedNodes.length || selectedEdges.length) && !performanceMode) {
      const selectedElements = [...selectedNodes, ...selectedEdges];
      selectedElementOutline.selectedObjects = selectedElements.map((selectedElement) => selectedElement.instance);
    } else {
      selectedElementOutline.selectedObjects = [];
    }
  }

  handleControls(newSelectedNodes, newSelectedEdges) {
    const {averagePositionPlaceholder, _setAveragePositionPlaceholder} = this.props;
    if (newSelectedEdges.length || newSelectedNodes.length === 0) {
      controls.detach();
    } else if (
      (
        newSelectedNodes.length === 1
        && averagePositionPlaceholder
        && !averagePositionPlaceholder.position.equals(newSelectedNodes[0].position)
      ) || (
        newSelectedNodes.length
        && (!averagePositionPlaceholder || Object.keys(averagePositionPlaceholder.userData).length !== newSelectedNodes.length)
      )
    ) {
      scene.remove(averagePositionPlaceholder);
      const newPlaceholder = new THREE.Object3D();
      if (newSelectedNodes.length === 1) {
        const {x, y, z} = newSelectedNodes[0].position;
        newPlaceholder.position.set(x, y, z);
        newPlaceholder.userData[newSelectedNodes[0].id] = new THREE.Vector3();
      } else {
        const averagePosition = calculateAveragePosition(newSelectedNodes, false);
        newPlaceholder.position.set(averagePosition.x, averagePosition.y, averagePosition.z);
        newSelectedNodes.forEach((node) => {
          newPlaceholder.userData[node.id] = averagePosition.clone().sub(node.position);
        });
      }
      networkElements.add(newPlaceholder);
      controls.attach(newPlaceholder);
      _setAveragePositionPlaceholder(newPlaceholder);
    }
  }

  updateSceneElements() {
    const {
      camera, performanceMode, networkBoundarySize, showBoundary, boundaryOpacity
    } = this.props;
    const {
      nodes: serializedNodes, edges: serializedEdges, _setNodesAndEdges
    } = this.props;
    networkElements = new THREE.Group();
    networkElements.name = 'Network';
    let nodeInstances;
    let edgeInstances;
    const nodes = serializedNodes.map((node) => {
      const nodeClass = new Node(
        node.position.x,
        node.position.y,
        node.position.z,
        node.size,
        node.color,
        node.id,
        node.name,
        node.data,
        node.colorLocked,
        node.shape,
        node.pathMap,
        node.visible,
        camera,
        performanceMode,
        networkBoundarySize
      );
      if (!performanceMode) networkElements.add(nodeClass.instance);
      return nodeClass;
    });
    if (performanceMode) {
      nodeInstances = new Nodes(nodes);
      edgeInstances = new Edges(serializedEdges, nodes);
      nodes.forEach((node) => node.setNodeInstances(nodeInstances));
      networkElements.add(nodeInstances.instances);
      networkElements.add(edgeInstances.instances);
    }
    const edges = serializedEdges.map((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);
      const edgeClass = new Edge(
        edge.id, sourceNode, targetNode, edge.size, edge.color, edge.visible, edge.data, edge.isDirected, edgeInstances
      );
      sourceNode.addSourceEdge(edgeClass);
      targetNode.addTargetEdge(edgeClass);
      if (!performanceMode) networkElements.add(edgeClass.instance);
      return edgeClass;
    });
    if (!nodes[0].data.degree) nodes.forEach((node) => node.calculateDegree());
    boundaryBox = new BoundaryBox(networkBoundarySize, showBoundary, boundaryOpacity);
    networkElements.add(boundaryBox.instance);
    scene.add(networkElements);
    nodes.forEach((node) => node.unserializePathMap(nodes));
    _setNodesAndEdges(nodes, edges, false);

    if (!performanceMode) {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      hoveredElementOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
      hoveredElementOutline.visibleEdgeColor.set(hoverElementOutlineColor);
      composer.addPass(hoveredElementOutline);
      selectedElementOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
      selectedElementOutline.visibleEdgeColor.set(selectedElementOutlineColor);
      composer.addPass(selectedElementOutline);
    }
  }

  lookAt(elements) {
    const {camera} = this.props;
    if (elements.length) {
      interpolation = 0;
      const position = calculateAveragePosition(elements);
      cameraControls.target = position;
      const rotationMatrix = new THREE.Matrix4().lookAt(camera.position, position, camera.up);
      targetQuaternion = new THREE.Quaternion();
      targetQuaternion.setFromRotationMatrix(rotationMatrix);
    }
  }

  cameraControls() {
    const {camera} = this.props;
    const delta = clock.getDelta();
    if (targetQuaternion) {
      camera.quaternion.slerp(targetQuaternion, delta * 5);
      if (interpolation >= 1) {
        interpolation = 0;
        targetQuaternion = undefined;
      } else {
        interpolation += delta;
      }
    } else {
      cameraControls.update();
    }
  }

  checkIntersect(e) {
    const {nodes, performanceMode} = this.props;
    const {camera} = this.props;
    const {clientX, clientY} = e;
    mousePosition.x = (clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    let newHoveredElement;
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length) {
      if (performanceMode) {
        const nodeInstanceElement = intersects.find((intersectedElement) => intersectedElement?.object.name === 'NodeInstances');
        if (nodeInstanceElement) newHoveredElement = nodes[nodeInstanceElement.instanceId];
      } else {
        newHoveredElement = intersects.find((intersectedElement) => (
          (intersectedElement?.object.name === 'Node'
            || intersectedElement?.object.name === 'Edge'
            || intersectedElement?.object.name === 'Arrow'
          ) && intersectedElement?.object.visible));
        if (newHoveredElement && (newHoveredElement.object.name === 'Edge' || newHoveredElement.object.name === 'Arrow')) {
          newHoveredElement = newHoveredElement.object.parent;
        }
      }
    }
    hoveredElement = newHoveredElement;
  }

  createScene() {
    const {
      _setDirected, _setNodesAndEdges, _setCamera, _setOctree, remoteNodes, remoteEdges, use2Dimensions, isDirected,
      performanceMode, networkBoundarySize, showBoundary, boundaryOpacity
    } = this.props;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvasWrapper.appendChild(renderer.domElement);

    scene = new THREE.Scene();
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
    camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z);

    cameraControls = new OrbitControls(camera, renderer.domElement);
    if (!performanceMode) {
      cameraControls.enableDamping = true;
      cameraControls.dampingFactor = 0.2;
    }

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    window.addEventListener('keyup', this.handleKeyUp);

    networkElements.name = 'Network';
    let nodeInstances;
    let edgeInstances;
    const nodes = remoteNodes.map((node, index) => {
      const nodeClass = new Node(
        Math.random() * networkBoundarySize - networkBoundarySize / 2,
        Math.random() * networkBoundarySize - networkBoundarySize / 2,
        use2Dimensions ? 0 : Math.random() * networkBoundarySize - networkBoundarySize / 2,
        1,
        '#008799',
        index,
        node.label,
        node.data,
        false,
        'Sphere',
        undefined,
        true,
        camera,
        performanceMode,
        networkBoundarySize
      );
      if (!performanceMode) networkElements.add(nodeClass.instance);
      return nodeClass;
    });
    if (performanceMode) {
      nodeInstances = new Nodes(nodes);
      edgeInstances = new Edges(remoteEdges, nodes);
      nodes.forEach((node) => node.setNodeInstances(nodeInstances));
      networkElements.add(nodeInstances.instances);
      networkElements.add(edgeInstances.instances);
    }
    const edges = remoteEdges.map((edge, index) => {
      const sourceNode = nodes.find((node) => {
        if (typeof edge.source === 'string') return node.name === edge.source;
        return node.id === edge.source;
      });
      const targetNode = nodes.find((node) => {
        if (typeof edge.source === 'string') return node.name === edge.target;
        return node.id === edge.target;
      });
      const edgeClass = new Edge(index, sourceNode, targetNode, 1, '#ffffff', true, edge.data, isDirected, edgeInstances);
      sourceNode.addSourceEdge(edgeClass);
      targetNode.addTargetEdge(edgeClass);
      if (!performanceMode) networkElements.add(edgeClass.instance);
      return edgeClass;
    });

    boundaryBox = new BoundaryBox(networkBoundarySize, showBoundary, boundaryOpacity);
    const octree = new Octree(
      new THREE.Box3(
        new THREE.Vector3(-networkBoundarySize / 2, -networkBoundarySize / 2, -networkBoundarySize / 2),
        new THREE.Vector3(networkBoundarySize / 2, networkBoundarySize / 2, networkBoundarySize / 2)
      ),
      4
    );
    nodes.forEach((node) => node.calculateDegree());

    networkElements.add(boundaryBox.instance);
    scene.add(octGroup);
    scene.add(networkElements);

    if (!performanceMode) {
      composer = new EffectComposer(renderer);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      hoveredElementOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
      hoveredElementOutline.visibleEdgeColor.set(hoverElementOutlineColor);
      composer.addPass(hoveredElementOutline);
      selectedElementOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
      selectedElementOutline.visibleEdgeColor.set(selectedElementOutlineColor);
      composer.addPass(selectedElementOutline);
    }

    controls = new TransformControls(camera, renderer.domElement);
    controls.setSize(0.5);
    scene.add(controls);

    _setCamera(camera);
    _setDirected(isDirected);
    _setNodesAndEdges(nodes, edges, false);
    _setOctree(octree);
  }

  drawOctree() {
    const {octree} = this.props;
    if (!octree.update) return;
    octree.update = false;
    for (let i = octGroup.children.length - 1; i >= 0; i--) {
      octGroup.remove(octGroup.children[i]);
    }
    const addToGroup = (currentTree) => {
      octGroup.add(currentTree.getBox());
      if (currentTree.bottomBackLeft) addToGroup(currentTree.bottomBackLeft);
      if (currentTree.topBackLeft) addToGroup(currentTree.topBackLeft);
      if (currentTree.topFrontLeft) addToGroup(currentTree.topFrontLeft);
      if (currentTree.bottomFrontLeft) addToGroup(currentTree.bottomFrontLeft);
      if (currentTree.bottomBackRight) addToGroup(currentTree.bottomBackRight);
      if (currentTree.topBackRight) addToGroup(currentTree.topBackRight);
      if (currentTree.topFrontRight) addToGroup(currentTree.topFrontRight);
      if (currentTree.bottomFrontRight) addToGroup(currentTree.bottomFrontRight);
    };
    addToGroup(octree);
  }

  animate() {
    const {
      orbitPreview, nodes, performanceMode, camera
    } = this.props;
    requestAnimationFrame(this.animate);
    if (orbitPreview) networkElements.rotateY(0.003);
    this.cameraControls();
    nodes.forEach((node) => node.label.updatePosition());
    // this.drawOctree();
    if (!performanceMode) {
      this.handleOutline();
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  render() {
    const {mouseDown} = this.state;
    if (renderer && !animationRunning) {
      animationRunning = true;
      this.animate();
    }
    return (
      <div
        id="network-view"
        className={`renderer${mouseDown ? ' hide-cursor' : ''}`}
        ref={(ref) => (this.canvasWrapper = ref)}
        onPointerDown={this.handleMouseDown}
        onPointerMove={this.handleMouseMove}
        onPointerUp={this.handleMouseUp}
      />
    );
  }
}

const mapStateToPros = (state) => ({
  orbitPreview: state.settings.orbitPreview,
  performanceMode: state.settings.performanceMode,
  camera: state.settings.camera,
  keyboardInputsBlocked: state.settings.keyboardInputsBlocked,
  networkBoundarySize: state.settings.networkBoundarySize,
  showBoundary: state.settings.showBoundary,
  boundaryOpacity: state.settings.boundaryOpacity,
  nodes: state.network.nodes,
  edges: state.network.edges,
  updateScene: state.network.updateScene,
  selectedNodes: state.network.selectedNodes,
  selectedEdges: state.network.selectedEdges,
  octree: state.network.octree,
  averagePositionPlaceholder: state.network.averagePositionPlaceholder
});

const mapDispatchToProps = (dispatch) => ({
  _setCamera: (camera) => dispatch(setCamera(camera)),
  _addToActionHistory: (positionChanges) => dispatch(addToActionHistory(positionChanges)),
  _setDirected: (directed) => dispatch(setDirected(directed)),
  _setNodesAndEdges: (nodes, edges, shouldUpdateScene) => dispatch(setNodesAndEdges(nodes, edges, shouldUpdateScene)),
  _setSelectedNodes: (nodes) => dispatch(setSelectedNodes(nodes)),
  _setSelectedEdges: (edges) => dispatch(setSelectedEdges(edges)),
  _setOctree: (octree) => dispatch(setOctree(octree)),
  _setAveragePositionPlaceholder: (placeholder) => dispatch(setAveragePositionPlaceholder(placeholder))
});

export default connect(mapStateToPros, mapDispatchToProps)(memo(Renderer));
