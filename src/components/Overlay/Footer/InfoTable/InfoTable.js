import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Select from '../../UI/Select/Select';
import Button from '../../UI/Button/Button';
import {setNodes, setSelectedNodes, setSortBy} from '../../../../redux/networkElements/networkElements.actions';

import './InfoTable.scss';

let mouseDownX = 0;

const InfoTable = () => {
  const {
    nodes, edges, selectedNodes, selectedEdges, sortBy, reversed
  } = useSelector((state) => state.networkElements);
  const [tableType, setTableType] = useState('Node Table');
  const dispatch = useDispatch();

  const changeSortValue = (value, e) => {
    if (e.clientX === mouseDownX) {
      dispatch(setSortBy(value));
    }
  };

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
              <th
                onMouseUp={(e) => changeSortValue('id', e)}
                onMouseDown={(e) => { mouseDownX = e.clientX; }}
                className={sortBy === 'id' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
              >
                ID
              </th>
              <th
                onMouseUp={(e) => changeSortValue('name', e)}
                onMouseDown={(e) => { mouseDownX = e.clientX; }}
                className={sortBy === 'name' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
              >
                Name
              </th>
              <th
                onMouseUp={(e) => changeSortValue('size', e)}
                onMouseDown={(e) => { mouseDownX = e.clientX; }}
                className={sortBy === 'size' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
              >
                Size
              </th>
              <th
                onMouseUp={(e) => changeSortValue('color', e)}
                onMouseDown={(e) => { mouseDownX = e.clientX; }}
                className={sortBy === 'color' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
              >
                Color
              </th>
              {Object.keys(nodes[0].data).map((dataPoint) => (
                <th
                  key={dataPoint}
                  onMouseUp={(e) => changeSortValue(dataPoint, e)}
                  onMouseDown={(e) => { mouseDownX = e.clientX; }}
                  className={sortBy === dataPoint ? `show-arrow${reversed ? ' reverse' : ''}` : null}
                >
                  {dataPoint}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nodes.map((node) => (
              <tr
                onClick={(e) => {
                  if (e.target.classList[0] !== 'lock') dispatch(setSelectedNodes([node]));
                }}
                className={selectedNodes.includes(node) ? 'selected' : ''}
                key={node.id}
              >
                <td>{node.id}</td>
                <td>{node.labelText}</td>
                <td>{node.size}</td>
                <td>
                  {`${node.color}`}
                  <div
                    className={`lock${node.colorLocked ? ' show' : ''}`}
                    onClick={() => {
                      console.log('set color locked to:', !node.colorLocked);
                      node.setColorLock(!node.colorLocked);
                      dispatch(setNodes(nodes));
                    }}
                  />
                </td>
                {Object.keys(node.data).map((dataPoint) => (
                  <td key={dataPoint}>{node.data[dataPoint]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InfoTable;
