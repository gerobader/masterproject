import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setNodes, setSelectedEdges, setSelectedNodes} from '../../../../../redux/networkElements/networkElements.actions';

import './NodeTable.scss';

let mouseDownX = 0;

const NodeTable = ({changeSortValue, nodes}) => {
  const {
    selectedNodes, sortNodesBy, reversed
  } = useSelector((state) => state.networkElements);
  const dispatch = useDispatch();
  return (
    <table>
      <thead>
        <tr>
          <th
            onMouseUp={(e) => changeSortValue('id', e, mouseDownX, 'node')}
            onMouseDown={(e) => { mouseDownX = e.clientX; }}
            className={sortNodesBy === 'id' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
          >
            ID
          </th>
          <th
            onMouseUp={(e) => changeSortValue('name', e, mouseDownX, 'node')}
            onMouseDown={(e) => { mouseDownX = e.clientX; }}
            className={sortNodesBy === 'name' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
          >
            Name
          </th>
          <th
            onMouseUp={(e) => changeSortValue('size', e, mouseDownX, 'node')}
            onMouseDown={(e) => { mouseDownX = e.clientX; }}
            className={sortNodesBy === 'size' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
          >
            Size
          </th>
          <th
            onMouseUp={(e) => changeSortValue('color', e, mouseDownX, 'node')}
            onMouseDown={(e) => { mouseDownX = e.clientX; }}
            className={sortNodesBy === 'color' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
          >
            Color
          </th>
          {Object.keys(nodes[0].data).map((dataPoint) => (
            <th
              key={dataPoint}
              onMouseUp={(e) => changeSortValue(dataPoint, e, mouseDownX, 'node')}
              onMouseDown={(e) => { mouseDownX = e.clientX; }}
              className={sortNodesBy === dataPoint ? `show-arrow${reversed ? ' reverse' : ''}` : null}
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
              if (e.target.classList[0] !== 'lock') {
                let newSelectedNodes = [node];
                if (e.ctrlKey) {
                  if (selectedNodes.includes(node)) {
                    newSelectedNodes = selectedNodes.filter((selectedNode) => selectedNode.id !== node.id);
                  } else {
                    newSelectedNodes = [...selectedNodes, node];
                  }
                }
                dispatch(setSelectedNodes(newSelectedNodes));
                dispatch(setSelectedEdges([]));
              }
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
  );
};

export default NodeTable;
