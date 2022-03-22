import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import NodeTable from './NodeTable/NodeTable';
import EdgeTable from './EdgeTable/EdgeTable';
import Select from '../../UI/Select/Select';
import Button from '../../UI/Button/Button';
import TextInput from '../../UI/TextInput/TextInput';
import {setNodes, setSortEdgesBy, setSortNodesBy} from '../../../../redux/networkElements/networkElements.actions';

import './InfoTable.scss';

const InfoTable = () => {
  const {nodes, edges} = useSelector((state) => state.networkElements);
  const [tableType, setTableType] = useState('Node Table');
  const [searchValue, setSearchValue] = useState('');
  const dispatch = useDispatch();

  const changeSortValue = (value, e, prevX, elementType) => {
    if (e.clientX === prevX) {
      dispatch(elementType === 'node' ? setSortNodesBy(value) : setSortEdgesBy(value));
    }
  };

  const calculateMeasures = () => {
    nodes.forEach((node) => node.computeStatisticalMeasures(nodes));
    dispatch(setNodes(nodes));
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
        <Button text="Calculate Statistical Measures" onClick={calculateMeasures}/>
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
