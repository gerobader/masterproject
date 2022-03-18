import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Select from '../../UI/Select/Select';
import Button from '../../UI/Button/Button';
import {setSelectedNodes} from '../../../../redux/networkElements/networkElements.actions';

import './InfoTable.scss';

const InfoTable = () => {
  const {
    nodes, edges, selectedNodes, selectedEdges
  } = useSelector((state) => state.networkElements);
  const [tableType, setTableType] = useState('Node Table');
  const dispatch = useDispatch();
  const calculateMeasures = () => {
    console.log('lol');
  };

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
        <Button text="Calculate Statistical Measures" onClick={calculateMeasures}/>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Size</th>
              <th>Color</th>
              {/* use a lock icon here to lock the color of a node? */}
              {Object.keys(nodes[0].data).map((dataPoint) => (<th key={dataPoint}>{dataPoint}</th>))}
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => {
              return (
                <tr
                  onClick={() => dispatch(setSelectedNodes([node]))}
                  className={selectedNodes.includes(node) ? 'selected' : ''}
                  key={node.id}
                >
                  <td>{node.id}</td>
                  <td>{node.labelText}</td>
                  <td>{node.size}</td>
                  <td>{`#${node.color.getHexString()}`}</td>
                  {Object.keys(node.data).map((dataPoint) => (
                    <td key={dataPoint}>{node.data[dataPoint]}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InfoTable;
