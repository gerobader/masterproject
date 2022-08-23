import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
// eslint-disable-next-line import/no-unresolved, import/no-webpack-loader-syntax
import StatisticalMeasuresWorker from 'worker-loader!./calculateStatisticalMeasures';
import NodeTable from './NodeTable/NodeTable';
import EdgeTable from './EdgeTable/EdgeTable';
import Select from '../../UI/Select/Select';
import Button from '../../UI/Button/Button';
import TextInput from '../../UI/TextInput/TextInput';
import {
  setNetworkName, setNetworkStatistics, setNodes, setSortEdgesBy, setSortNodesBy
} from '../../../../redux/network/network.actions';
import {setErrorMessage} from '../../../../redux/settings/settings.actions';

import './InfoTable.scss';

let shortestPathWorker;
let statisticalMeasuresWorker;
let timeArray = [];
let progressCount = 0;
let startTime;

const InfoTable = ({setProgressInfo}) => {
  const {
    nodes, edges, directed, name: networkName, diameter: networkDiameter, radius: networkRadius, density: networkDensity,
    averageGeodesicDistance: networkAverageGeodesicDistance, averageDegree: networkAverageDegree, reciprocity: networkReciprocity,
    adjacencyMatrix
  } = useSelector((state) => state.network);
  const [tableType, setTableType] = useState('Node Table');
  const [searchValue, setSearchValue] = useState('');
  const [calculationRunning, setCalculationRunning] = useState(false);
  const dispatch = useDispatch();

  const changeSortValue = (value, e, prevX, elementType) => {
    if (e.clientX === prevX) {
      dispatch(elementType === 'node' ? setSortNodesBy(value) : setSortEdgesBy(value));
    }
  };

  const stopCalculation = () => {
    if (statisticalMeasuresWorker) statisticalMeasuresWorker.terminate();
    if (shortestPathWorker) shortestPathWorker.terminate();
    setCalculationRunning(false);
    setProgressInfo(undefined);
  };

  const resetTimeVars = () => {
    timeArray = [];
    progressCount = 0;
    startTime = new Date();
  };

  const getRemainingTime = () => {
    const timeTaken = new Date() - startTime;
    startTime = new Date();
    timeArray.push(timeTaken);
    if (timeArray.length > 50) timeArray.shift();
    progressCount += 1;
    const averageTimePerNode = timeArray.reduce((a, b) => a + b, 0) / timeArray.length;
    return averageTimePerNode * (nodes.length - progressCount);
  };

  // eslint-disable-next-line no-shadow
  const calculateNetworkStatistics = (nodes) => {
    const nodeEccentricities = [];
    const allDistances = [];
    let degreeSum = 0;
    nodes.forEach((node) => {
      degreeSum += node.data.degree;
      let longestDistance = 0;
      Object.keys(node.pathMap).forEach((nodeIndex) => {
        const paths = node.pathMap[nodeIndex];
        allDistances.push(paths.distance);
        if (paths.distance > longestDistance) longestDistance = paths.distance;
      });
      nodeEccentricities.push(longestDistance);
    });
    const diameter = Math.max(...nodeEccentricities);
    const radius = Math.min(...nodeEccentricities);
    const averageGeodesicDistance = Math.round(
      ((1 / (nodes.length * (nodes.length - 1))) * allDistances.reduce((partialSum, distance) => partialSum + distance, 0)) * 1000
    ) / 1000;
    const averageDegree = Math.round((degreeSum / nodes.length) * 1000) / 1000;

    let reciprocity;
    if (directed) {
      let mutualConnectionCount = 0;
      nodes.forEach((node) => {
        node.sourceForEdges.forEach((outgoing) => {
          outgoing.targetNode.sourceForEdges.find((targetNodeOutgoing) => {
            if (targetNodeOutgoing.targetNode.id === node.id) {
              mutualConnectionCount++;
              return true;
            }
            return false;
          });
        });
      });
      reciprocity = Math.round((mutualConnectionCount / edges.length) * 1000) / 1000;
    }

    let density = Math.round((edges.length / (nodes.length * (nodes.length - 1))) * 1000) / 1000;
    if (!directed) density *= 2;
    dispatch(setNetworkStatistics(diameter, radius, averageGeodesicDistance, averageDegree, reciprocity, density));
  };

  const calculateStatisticalMeasures = (nodeClones) => {
    statisticalMeasuresWorker = new StatisticalMeasuresWorker();
    statisticalMeasuresWorker.postMessage({nodeClones, adjacencyMatrix, directed});
    resetTimeVars();
    statisticalMeasuresWorker.addEventListener('message', (event) => {
      const {type, nodeId, updatedClones} = event.data;
      if (type === 'finished') {
        nodes.forEach((node) => {
          Object.keys(updatedClones[node.id].data).forEach((dataPointName) => {
            node.setData(dataPointName, updatedClones[node.id].data[dataPointName]);
          });
        });
        calculateNetworkStatistics(nodes);
        setCalculationRunning(false);
        setProgressInfo(undefined);
        dispatch(setNodes([...nodes]));
      } else if (type === 'progress') {
        const currentNode = nodes.find((node) => node.id === nodeId);
        setProgressInfo({
          info: currentNode.name,
          percentage: (progressCount / nodes.length) * 100,
          remainingTime: getRemainingTime(),
          type: 'Calculating statistical measures',
          step: 2
        });
      } else if (type === 'error') {
        dispatch(setErrorMessage(event.data.message));
      }
    });
  };

  const calculateShortestPathBetweenNodes = () => {
    if (calculationRunning) return;
    setCalculationRunning(true);
    const edgeClones = {};
    const nodeClones = {};
    edges.forEach((edge) => {
      edgeClones[edge.id] = {
        sourceNode: edge.sourceNode.id,
        targetNode: edge.targetNode.id
      };
    });
    nodes.forEach((node) => {
      nodeClones[node.id] = {
        id: node.id,
        targetForEdges: node.targetForEdges.map((edge) => edgeClones[edge.id]),
        sourceForEdges: node.sourceForEdges.map((edge) => edgeClones[edge.id])
      };
    });
    shortestPathWorker = new Worker('calculateAllPaths.js');
    shortestPathWorker.postMessage(nodeClones);
    resetTimeVars();
    shortestPathWorker.addEventListener('message', (event) => {
      if (event.data.type === 'finished') {
        const calculatedPaths = event.data.nodePathMaps;
        nodes.forEach((node) => {
          const pathMap = {};
          Object.keys(calculatedPaths[node.id]).forEach((targetNodeId) => {
            nodeClones[node.id].pathMap = calculatedPaths[node.id];
            const targetNodeIdInt = parseInt(targetNodeId, 10);
            const paths = calculatedPaths[node.id][targetNodeIdInt].paths.map((path) => {
              const newPathSet = new Set();
              path.forEach((pathNode) => {
                newPathSet.add(nodes.find((nodeObject) => nodeObject.id === pathNode.id));
              });
              return newPathSet;
            });
            pathMap[targetNodeIdInt] = {
              target: nodes.find((nodeObject) => nodeObject.id === targetNodeIdInt),
              paths: paths,
              distance: calculatedPaths[node.id][targetNodeIdInt].distance
            };
          });
          // eslint-disable-next-line no-param-reassign
          node.pathMap = pathMap;
        });
        calculateStatisticalMeasures(nodeClones);
      } else if (event.data.type === 'progress') {
        setProgressInfo({
          percentage: (event.data.progress.progressCount / nodes.length) * 100,
          info: `(${event.data.progress.progressCount}/${nodes.length}): ${nodes[event.data.progress.nodeId].name}`,
          type: 'Calculating shortest Paths between Nodes',
          remainingTime: getRemainingTime(),
          step: 1
        });
      } else if (event.data.type === 'error') {
        stopCalculation();
        dispatch(setErrorMessage(event.data.message));
      }
    });
  };

  const adjustedSearchValue = searchValue.trim().toLowerCase();
  let filteredElements = tableType === 'Node Table' ? nodes : edges;
  if (adjustedSearchValue) {
    if (tableType === 'Node Table') {
      filteredElements = nodes.filter((node) => (node.name ? node.name.toLowerCase().includes(adjustedSearchValue) : false));
    } else {
      filteredElements = edges.filter((edge) => {
        let returnVal = false;
        if (edge.sourceNode.name) returnVal = edge.sourceNode.name.toLowerCase().includes(adjustedSearchValue);
        if (!returnVal && edge.targetNode.name) returnVal = edge.targetNode.name.toLowerCase().includes(adjustedSearchValue);
        return returnVal;
      });
    }
  }
  return (
    <div className="info-table">
      <div className="controls">
        <Select
          options={['Node Table', 'Edge Table']}
          value={tableType}
          setSelected={setTableType}
          alwaysShowArrow
        />
        <TextInput value={searchValue} setValue={setSearchValue} placeholder="Search"/>
        {calculationRunning
          ? <Button className="danger" text="Stop Calculation" onClick={stopCalculation}/>
          : <Button text="Analyse Network" onClick={calculateShortestPathBetweenNodes}/>}
      </div>
      {tableType === 'Node Table' ? (
        <NodeTable changeSortValue={changeSortValue} nodesToShow={filteredElements}/>
      ) : (
        <EdgeTable changeSortValue={changeSortValue} edgesToShow={filteredElements}/>
      )}
      <div className="network-info-wrapper">
        <div className="heading">Network Info</div>
        <div className="info-wrapper">
          <div className="wrapper">
            <p className="network-info">
              <span className="property-name">Name:</span>
              <TextInput
                value={networkName}
                setValue={(value) => dispatch(setNetworkName(value))}
                placeholder="Network Name"
              >
                {networkName}
              </TextInput>
            </p>
            <p className="network-info">
              <span className="property-name">Radius:</span>
              <span>{networkRadius || '-'}</span>
            </p>
            <p className="network-info">
              <span className="property-name">Diameter:</span>
              <span>{networkDiameter || '-'}</span>
            </p>
            <p className="network-info" title="Average Geodesic Distance">
              <span className="property-name">AGD:</span>
              <span>{networkAverageGeodesicDistance || '-'}</span>
            </p>
          </div>
          <div className="wrapper">
            <p className="network-info">
              <span className="property-name">Density:</span>
              <span>{networkDensity || '-'}</span>
            </p>
            <p className="network-info">
              <span className="property-name">Average Degree:</span>
              <span>{networkAverageDegree || '-'}</span>
            </p>
            {directed && (
              <p className="network-info">
                <span className="property-name">Reciprocity:</span>
                <span>{typeof networkReciprocity === 'number' ? networkReciprocity : '-'}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoTable;
