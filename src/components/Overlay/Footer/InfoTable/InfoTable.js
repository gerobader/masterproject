import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import NodeTable from './NodeTable/NodeTable';
import EdgeTable from './EdgeTable/EdgeTable';
import Select from '../../UI/Select/Select';
import Button from '../../UI/Button/Button';
import TextInput from '../../UI/TextInput/TextInput';
import {setNodes, setSortEdgesBy, setSortNodesBy} from '../../../../redux/networkElements/networkElements.actions';

import './InfoTable.scss';

const InfoTable = ({setProgressInfo}) => {
  const {nodes, edges} = useSelector((state) => state.networkElements);
  const [tableType, setTableType] = useState('Node Table');
  const [searchValue, setSearchValue] = useState('');
  const [calculationRunning, setCalculationRunning] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {

  }, []);

  const changeSortValue = (value, e, prevX, elementType) => {
    if (e.clientX === prevX) {
      dispatch(elementType === 'node' ? setSortNodesBy(value) : setSortEdgesBy(value));
    }
  };

  const calculateStatisticalMeasures = async () => {
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
          name: node.labelText,
          targetForEdges: node.targetForEdges.map((edge) => edgeClones[edge.id]),
          sourceForEdges: node.sourceForEdges.map((edge) => edgeClones[edge.id])
        };
      });
      const worker = new Worker('worker.js');
      const start = new Date();
      worker.postMessage(nodeClones);
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
            node.computeStatisticalMeasures(nodes);
          });
          const time = new Date() - start;
          console.log('took', time, 'ms');
          dispatch(setNodes(nodes));
        } else if (event.data.type === 'progress') {
          setProgressInfo(event.data.progress);
        }
      });
    }
  };

  const adjustedSearchValue = searchValue.trim().toLowerCase();
  let filteredElements;
  if (tableType === 'Node Table') {
    filteredElements = nodes.filter((node) => node.labelText.toLowerCase().includes(adjustedSearchValue));
  } else {
    filteredElements = edges.filter((edge) => (
      edge.sourceNode.labelText.toLowerCase().includes(adjustedSearchValue)
      || edge.targetNode.labelText.toLowerCase().includes(adjustedSearchValue)
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
          opensUp
        />
        <TextInput value={searchValue} setValue={setSearchValue} placeholder="Search"/>
        <Button text="Calculate Statistical Measures" onClick={calculateStatisticalMeasures}/>
      </div>
      <div className="table-wrapper">
        {tableType === 'Node Table' ? (
          <NodeTable changeSortValue={changeSortValue} nodes={filteredElements}/>
        ) : (
          <EdgeTable changeSortValue={changeSortValue} edges={filteredElements}/>
        )}
      </div>
    </div>
  );
};

export default InfoTable;
