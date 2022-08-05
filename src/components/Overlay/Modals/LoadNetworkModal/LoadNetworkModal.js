import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import * as THREE from 'three';
import * as neo4j from 'neo4j-driver';
import Label from '../../../Renderer/Elements/Label';
import Modal from '../Modal';
import FileUpload from '../../UI/FileUpload/FileUpload';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Button from '../../UI/Button/Button';
import Select from '../../UI/Select/Select';
import Loader from '../../UI/Loader/Loader';
import {createNodes, createEdges} from '../../../utility';
import {
  setDirected,
  setNetworkName,
  setNetworkStatistics,
  setNodesAndEdges,
  setSelectedEdges,
  setSelectedNodes
} from '../../../../redux/network/network.actions';
import {
  resetActionHistory,
  setNetworkBoundarySize,
  setPerformanceMode, setShowAxes,
  setShowLabel,
  setShowLoadNetworkModal
} from '../../../../redux/settings/settings.actions';
import * as miserables from '../../../../data/performanceTest/0_miserables_klein.json';
import * as middleSizedNetwork from '../../../../data/performanceTest/1_mittel.json';
import * as bigNetwork from '../../../../data/performanceTest/2_groesser.json';
import * as programArchitecture from '../../../../data/programmArchitecture.json';

import './LoadNetworkModal.scss';

const networks = ['gameofthrones', 'movies', 'twitter', 'smallSize', 'midSize', 'largeSize', 'programArchitecture'];

const LoadNetworkModal = () => {
  const {nodes} = useSelector((state) => state.network);
  const {showLoadNetworkModal, axes, networkBoundarySize} = useSelector((state) => state.settings);
  const [networkData, setNetworkData] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState();
  const [usePerformanceMode, setUsePerformanceMode] = useState(false);
  const [fileName, setFileName] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const loadNetworkData = (network) => {
    nodes.forEach((node) => node.label.removeFromDom());
    dispatch(setSelectedNodes([]));
    dispatch(setSelectedEdges([]));
    dispatch(setPerformanceMode(usePerformanceMode));
    dispatch(setNetworkName(network.name || fileName.split('.')[0]));
    if (network.showLabel) dispatch(setShowLabel(network.showLabel));
    if (network.networkBoundarySize) dispatch(setNetworkBoundarySize(network.networkBoundarySize));
    dispatch(setDirected(Boolean(network.directed)));
    const newNodes = createNodes(network.nodes, network.networkBoundarySize || networkBoundarySize);
    const newEdges = createEdges(network.edges || network.links);
    dispatch(setNodesAndEdges(newNodes, newEdges, true));
    dispatch(setNetworkStatistics(
      network?.diameter, network?.radius, network?.averageGeodesicDistance, network?.averageDegree,
      network?.reciprocity, network?.density
    ));
    if (network.axesInfo) {
      dispatch(setShowAxes(network.axesInfo.showAxes));
      axes.setVisibility(network.axesInfo.showAxes);
      axes.setPosition(network.networkBoundarySize);
      axes.setAxisLabel('x', network.axesInfo.xAxis.text);
      axes.setAxisLabel('y', network.axesInfo.yAxis.text);
      axes.setAxisLabel('z', network.axesInfo.zAxis.text);
      axes.xAxisDivisions = network.axesInfo.xAxis?.divisions.map((label) => (
        new Label(
          label.text,
          new THREE.Vector3(label.position.x, label.position.y, label.position.z),
          axes.camera,
          !axes.visible,
          axes.axisColor.x
        )
      ));
      axes.yAxisDivisions = network.axesInfo.yAxis?.divisions.map((label) => (
        new Label(
          label.text,
          new THREE.Vector3(label.position.x, label.position.y, label.position.z),
          axes.camera,
          !axes.visible,
          axes.axisColor.y
        )
      ));
      axes.zAxisDivisions = network.axesInfo.zAxis?.divisions.map((label) => (
        new Label(
          label.text,
          new THREE.Vector3(label.position.x, label.position.y, label.position.z),
          axes.camera,
          !axes.visible,
          axes.axisColor.z
        )
      ));
    }
    dispatch(resetActionHistory());
    dispatch(setShowLoadNetworkModal(false));
    setIsLoading(false);
    setTimeout(() => {
      setNetworkData(undefined);
      setSelectedNetwork(undefined);
      setFileName(undefined);
    }, 500);
  };

  const getTestNetworkData = (network) => {
    const testEdges = network.links.map((link) => {
      const edge = {source: link.source, target: link.target, data: {}};
      if (link.value) edge.data.value = link.value;
      return edge;
    });
    const testNodes = network.nodes.map((node) => {
      const newNode = {
        label: node.name,
        data: {}
      };
      if (node.group !== undefined) newNode.data.group = node.group;
      if (node.attributes && typeof node.attributes === 'object') {
        newNode.data = {
          ...newNode.data,
          ...node.attributes
        };
      }
      return newNode;
    });
    return {testNodes, testEdges};
  };

  const getNetworkData = async () => {
    if (selectedNetwork && !isLoading) {
      dispatch(setNetworkName(selectedNetwork));
      setIsLoading(true);
      const neoDriver = neo4j.driver(
        'bolt://demo.neo4jlabs.com',
        neo4j.auth.basic(selectedNetwork, selectedNetwork),
        {encrypted: true}
      );
      const session = await neoDriver.session({database: selectedNetwork});
      let res;
      const newNodes = [];
      let edges = [];
      let isDirected = false;
      if (selectedNetwork === 'gameofthrones') {
        res = await session.run('MATCH (n)-[:INTERACTS1]->(m) RETURN n.name as source, m.name as target');
        await session.close();
        edges = res.records.map((r) => {
          const source = r.get('source');
          const target = r.get('target');
          if (!newNodes.some((node) => node.label === source)) {
            newNodes.push({label: source, data: {}});
          }
          if (!newNodes.some((node) => node.label === target)) {
            newNodes.push({label: target, data: {}});
          }
          return {source, target};
        });
      } else if (selectedNetwork === 'movies') {
        res = await session.run('MATCH p=()-[r:ACTED_IN]->() RETURN p');
        isDirected = true;
        await session.close();
        edges = res.records.map((r) => {
          const path = r.get('p');
          const source = path.start.properties.name;
          const target = path.end.properties.title;
          if (!newNodes.some((node) => node.label === source)) {
            newNodes.push({
              label: source,
              data: {
                type: 'actor'
              }
            });
          }
          if (!newNodes.some((node) => node.label === target)) {
            newNodes.push({
              label: target,
              data: {
                type: 'movie'
              }
            });
          }
          return {source, target};
        });
      } else if (selectedNetwork === 'twitter') {
        res = await session.run('MATCH p=()-[r:FOLLOWS]->() RETURN p LIMIT 15000');
        isDirected = true;
        await session.close();
        edges = res.records.map((r) => {
          const path = r.get('p');
          const source = path.start.properties.name;
          const target = path.end.properties.name;
          if (!newNodes.find((node) => node.label === source)) {
            newNodes.push({
              label: source,
              data: {
                followers: path.start.properties.followers.low,
                following: path.start.properties.following.low,
                location: path.start.properties.location
              }
            });
          }
          if (!newNodes.find((node) => node.label === target)) {
            newNodes.push({
              label: target,
              data: {
                followers: path.end.properties.followers.low,
                following: path.end.properties.following.low,
                location: path.end.properties.location
              }
            });
          }
          return {source, target};
        });
      } else if (selectedNetwork === 'smallSize') {
        const {testNodes, testEdges} = getTestNetworkData(miserables.default);
        edges = testEdges;
        testNodes.forEach((node) => newNodes.push(node));
      } else if (selectedNetwork === 'midSize') {
        const {testNodes, testEdges} = getTestNetworkData(middleSizedNetwork.default);
        edges = testEdges;
        testNodes.forEach((node) => newNodes.push(node));
      } else if (selectedNetwork === 'largeSize') {
        const {testNodes, testEdges} = getTestNetworkData(bigNetwork.default);
        edges = testEdges;
        testNodes.forEach((node) => newNodes.push(node));
      } else if (selectedNetwork === 'programArchitecture') {
        isDirected = true;
        const {testNodes, testEdges} = getTestNetworkData(programArchitecture.default);
        edges = testEdges;
        testNodes.forEach((node) => newNodes.push(node));
      }
      loadNetworkData({
        name: selectedNetwork,
        directed: isDirected,
        nodes: newNodes,
        edges
      });
    }
  };

  const loadNetwork = () => {
    if (!isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        if (networkData) loadNetworkData(networkData);
        else getNetworkData();
      }, 10);
    }
  };

  const manageNetworkInputs = (network, type) => {
    if (type === 'upload') {
      setNetworkData(network);
      setSelectedNetwork(undefined);
    } else if (type === 'select') {
      setSelectedNetwork(network);
      setNetworkData(undefined);
      setFileName(undefined);
    }
  };

  return (
    <Modal
      className="load-network"
      show={showLoadNetworkModal}
      headline="Load Network"
      closeFunction={() => dispatch(setShowLoadNetworkModal(false))}
    >
      <FileUpload
        id="network-upload"
        labelText="Choose File"
        onFileLoaded={(network) => manageNetworkInputs(network, 'upload')}
        networkData={networkData}
        fileName={fileName}
        setFileName={setFileName}
      />
      <div className="separator-wrapper">
        <div className="line"/>
        <p>or</p>
      </div>
      <Select
        options={networks}
        value={selectedNetwork}
        setSelected={(network) => manageNetworkInputs(network, 'select')}
        defaultOption="- Select Network -"
        className="extra-wide"
        alwaysShowArrow
      />
      <Checkbox
        text="Use Performance Mode"
        checked={usePerformanceMode}
        setChecked={setUsePerformanceMode}
        name="use-performance-mode"
      />
      <div className="button-wrapper">
        <Button text="Load Network" onClick={loadNetwork} disabled={!networkData && !selectedNetwork}/>
        {isLoading && <Loader/>}
      </div>
    </Modal>
  );
};

export default LoadNetworkModal;
