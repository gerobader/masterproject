import React, {Component, createRef, memo} from 'react';
import {connect} from 'react-redux';
import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass';
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass';
import {TransformControls} from 'three/examples/jsm/controls/TransformControls';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Axes from './Elements/Axes';
import Node from './Elements/Node';
import Nodes from './Elements/Nodes';
import Edge from './Elements/Edge';
import Edges from './Elements/Edges';
import BoundaryBox from './Elements/BoundaryBox';
import Octree from '../Overlay/Controls/Layout/Octree';
import {
  setSelectedNodes, setSelectedEdges, setNodesAndEdges, setAveragePositionPlaceholder, setDirected, setOctree
} from '../../redux/network/network.actions';
import {
  addToActionHistory, undoAction, redoAction, setCameraControls, setAxes
} from '../../redux/settings/settings.actions';
import {calculateAveragePosition} from '../utility';
import {initialCameraPosition, hoverElementOutlineColor, selectedElementOutlineColor} from '../constants';

import './Renderer.scss';

let scene;
let renderer;
let composer;
let controls;
let camera;
let hoveredElement;
let networkElements = new THREE.Group();
let animationRunning = false;
let boundaryBox;
const controlKeys = ['f', 'escape', 'z'];
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
    this.canvasWrapper = createRef();
    this.createScene = this.createScene.bind(this);
    this.animate = this.animate.bind(this);
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

  // eslint-disable-next-line class-methods-use-this
  handleMouseDown(e) {
    e.preventDefault();
    targetQuaternion = undefined;
    interpolation = 0;
  }

  handleMouseUp(e) {
    const {
      selectedNodes: currentlySelectedNodes, _addToActionHistory, _setSelectedNodes, _setSelectedEdges, cameraControls
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
  }

  handleMouseMove(e) {
    const {selectedNodes, averagePositionPlaceholder, cameraControls} = this.props;
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
      _setAveragePositionPlaceholder, _addToActionHistory, keyboardInputsBlocked, _undoAction, _redoAction
    } = this.props;
    const key = e.key.toLowerCase();
    if (controlKeys.includes(key) && !keyboardInputsBlocked) {
      if (key === 'f') {
        this.lookAt([...selectedNodes, ...selectedEdges]);
      } else if (key === 'escape') {
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
      } else if (key === 'z') {
        if (e.ctrlKey) {
          if (e.shiftKey) _redoAction();
          else _undoAction();
        }
      }
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
      performanceMode, networkBoundarySize, showBoundary, boundaryOpacity, directed, nodes: serializedNodes,
      edges: serializedEdges, _setNodesAndEdges, _setOctree, cameraControls, showLabel
    } = this.props;
    networkElements = new THREE.Group();
    networkElements.name = 'Network';
    let nodeInstances;
    let edgeInstances;
    const nodes = serializedNodes.map((node, index) => {
      const nodeClass = new Node(
        node.position ? node.position.x : Math.random() * networkBoundarySize - networkBoundarySize / 2,
        node.position ? node.position.y : Math.random() * networkBoundarySize - networkBoundarySize / 2,
        node.position ? node.position.z : Math.random() * networkBoundarySize - networkBoundarySize / 2,
        node.size || 1,
        node.color || '#008799',
        node.id || index,
        node.name || node.label,
        node.data || {},
        node.colorLocked || false,
        node.shape || 'Sphere',
        node.pathMap,
        node.visible || true,
        camera,
        performanceMode,
        networkBoundarySize,
        showLabel !== 2
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
    const edges = serializedEdges.map((edge, index) => {
      const sourceNode = nodes.find(
        (node) => (typeof edge.source === 'string' ? node.name === edge.source : node.id === edge.source)
      );
      const targetNode = nodes.find(
        (node) => (typeof edge.target === 'string' ? node.name === edge.target : node.id === edge.target)
      );
      const edgeClass = new Edge(
        edge.id || index,
        sourceNode,
        targetNode,
        edge.size || 1,
        edge.color || '#ffffff',
        edge.visible || true,
        edge.data || {},
        edge.isDirected || directed,
        edgeInstances
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

    const octree = new Octree(
      new THREE.Box3(
        new THREE.Vector3(-networkBoundarySize / 2, -networkBoundarySize / 2, -networkBoundarySize / 2),
        new THREE.Vector3(networkBoundarySize / 2, networkBoundarySize / 2, networkBoundarySize / 2)
      ),
      4
    );

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
      cameraControls.enableDamping = true;
    } else {
      cameraControls.enableDamping = false;
    }
    _setNodesAndEdges(nodes, edges, false);
    _setOctree(octree);
  }

  lookAt(elements) {
    const {cameraControls} = this.props;
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
    const {cameraControls} = this.props;
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
    const {_setCameraControls, _setAxes, networkBoundarySize} = this.props;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvasWrapper.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
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

    const cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.dampingFactor = 0.2;
    controls = new TransformControls(camera, renderer.domElement);
    controls.setSize(0.5);

    const axes = new Axes(networkBoundarySize, camera);
    scene.add(axes.instance);

    scene.add(controls);
    scene.add(octGroup);

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
    window.addEventListener('keyup', this.handleKeyUp);

    _setCameraControls(cameraControls);
    _setAxes(axes);
  }

  drawOctree() {
    const {octree} = this.props;
    if (!octree || !octree.update) return;
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
      orbitPreview, nodes, performanceMode, axes
    } = this.props;
    requestAnimationFrame(this.animate);
    if (orbitPreview) networkElements.rotateY(0.003);
    this.cameraControls();
    nodes.forEach((node) => node.label.updatePosition());
    axes.updateLabelPositions();
    // this.drawOctree();
    if (!performanceMode && composer) {
      this.handleOutline();
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  render() {
    if (renderer && !animationRunning) {
      animationRunning = true;
      this.animate();
    }
    return (
      <div
        id="network-view"
        className="renderer"
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
  cameraControls: state.settings.cameraControls,
  keyboardInputsBlocked: state.settings.keyboardInputsBlocked,
  networkBoundarySize: state.settings.networkBoundarySize,
  showBoundary: state.settings.showBoundary,
  showLabel: state.settings.showLabel,
  boundaryOpacity: state.settings.boundaryOpacity,
  nodes: state.network.nodes,
  edges: state.network.edges,
  directed: state.network.directed,
  updateScene: state.network.updateScene,
  selectedNodes: state.network.selectedNodes,
  selectedEdges: state.network.selectedEdges,
  octree: state.network.octree,
  averagePositionPlaceholder: state.network.averagePositionPlaceholder,
  axes: state.settings.axes
});

const mapDispatchToProps = (dispatch) => ({
  _setCameraControls: (cameraControls) => dispatch(setCameraControls(cameraControls)),
  _setAxes: (axes) => dispatch(setAxes(axes)),
  _addToActionHistory: (positionChanges) => dispatch(addToActionHistory(positionChanges)),
  _setDirected: (directed) => dispatch(setDirected(directed)),
  _setNodesAndEdges: (nodes, edges, shouldUpdateScene) => dispatch(setNodesAndEdges(nodes, edges, shouldUpdateScene)),
  _setSelectedNodes: (nodes) => dispatch(setSelectedNodes(nodes)),
  _setSelectedEdges: (edges) => dispatch(setSelectedEdges(edges)),
  _setOctree: (octree) => dispatch(setOctree(octree)),
  _setAveragePositionPlaceholder: (placeholder) => dispatch(setAveragePositionPlaceholder(placeholder)),
  _undoAction: () => dispatch(undoAction()),
  _redoAction: () => dispatch(redoAction())
});

export default connect(mapStateToPros, mapDispatchToProps)(memo(Renderer));
