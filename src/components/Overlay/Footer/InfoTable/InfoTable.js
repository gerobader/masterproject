import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import NodeTable from './NodeTable/NodeTable';
import EdgeTable from './EdgeTable/EdgeTable';
import Select from '../../UI/Select/Select';
import Button from '../../UI/Button/Button';
import TextInput from '../../UI/TextInput/TextInput';
import {
  setNetworkName, setNetworkStatistics, setNodes, setSortEdgesBy, setSortNodesBy
} from '../../../../redux/network/network.actions';

import './InfoTable.scss';

const InfoTable = ({setProgressInfo}) => {
  const {
    nodes, selectedNodes, edges, selectedEdges, name: networkName, diameter: networkDiameter, radius: networkRadius,
    averageGeodesicDistance: networkAverageGeodesicDistance, averageDegree: networkAverageDegree
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
      (allDistances.reduce((partialSum, distance) => partialSum + distance, 0) / allDistances.length) * 1000
    ) / 1000;
    const averageDegree = Math.round((degreeSum / nodes.length) * 1000) / 1000;
    dispatch(setNetworkStatistics(diameter, radius, averageGeodesicDistance, averageDegree));
  };

  const calculateStatisticalMeasures = () => {
    if (!calculationRunning) {
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
          name: node.name,
          targetForEdges: node.targetForEdges.map((edge) => edgeClones[edge.id]),
          sourceForEdges: node.sourceForEdges.map((edge) => edgeClones[edge.id])
        };
      });
      const worker = new Worker('calculateAllPaths.js');
      worker.postMessage(nodeClones);
      const timeArray = [];
      let progressCount = 0;
      let startTime = new Date();
      worker.addEventListener('message', (event) => {
        if (event.data.type === 'success') {
          setProgressInfo(undefined);
          const calculatedPaths = event.data.nodePathMaps;
          setCalculationRunning(false);
          nodes.forEach((node) => {
            const pathMap = {};
            Object.keys(calculatedPaths[node.id]).forEach((targetNodeId) => {
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
          nodes.forEach((node) => node.computeStatisticalMeasures(nodes));
          calculateNetworkStatistics(nodes);
          dispatch(setNodes([...nodes]));
        } else if (event.data.type === 'progress') {
          const timeTaken = new Date() - startTime;
          timeArray.push(timeTaken);
          if (timeArray.length > 50) timeArray.shift();
          progressCount += 1;
          const averageTimePerNode = timeArray.reduce((a, b) => a + b, 0) / timeArray.length;
          const remainingTime = averageTimePerNode * (nodes.length - progressCount);
          startTime = new Date();
          setProgressInfo({...event.data.progress, remainingTime});
        }
      });
    }
  };

  const adjustedSearchValue = searchValue.trim().toLowerCase();
  let filteredElements;
  if (tableType === 'Node Table') {
    filteredElements = nodes.filter((node) => node.name.toLowerCase().includes(adjustedSearchValue));
  } else {
    filteredElements = edges.filter((edge) => (
      edge.sourceNode.name.toLowerCase().includes(adjustedSearchValue)
      || edge.targetNode.name.toLowerCase().includes(adjustedSearchValue)
    ));
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
        <Button text="Calculate Statistical Measures" onClick={calculateStatisticalMeasures}/>
      </div>
      <div className="table-wrapper">
        {tableType === 'Node Table' ? (
          <NodeTable changeSortValue={changeSortValue} nodesToShow={filteredElements}/>
        ) : (
          <EdgeTable changeSortValue={changeSortValue} edgesToShow={filteredElements}/>
        )}
      </div>
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
              <span className="property-name">Average Degree:</span>
              <span>{networkAverageDegree || '-'}</span>
            </p>
            <p className="network-info">
              <span className="property-name">Nodes:</span>
              <span>
                {`${nodes.length}${selectedNodes.length ? ` (${selectedNodes.length})` : ''}`}
              </span>
            </p>
            <p className="network-info">
              <span className="property-name">Edges:</span>
              <span>{`${edges.length}${selectedEdges.length ? ` (${selectedEdges.length})` : ''}`}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoTable;
