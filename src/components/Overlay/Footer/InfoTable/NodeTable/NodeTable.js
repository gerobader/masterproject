import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setNodes, setSelectedEdges, setSelectedNodes} from '../../../../../redux/networkElements/networkElements.actions';

import './NodeTable.scss';

let mouseDownX = 0;

const NodeTable = ({changeSortValue, nodes}) => {
  const {
    selectedNodes, sortNodesBy, nodesReversed
  } = useSelector((state) => state.networkElements);
  const dispatch = useDispatch();
  return (
    <table>
      <thead>
        <tr>
          {['id', 'name', 'size', 'color', ...Object.keys(nodes[0].data)].map((value) => {
            const result = value.replace(/([A-Z])/g, ' $1');
            const titleCaseValue = result.charAt(0).toUpperCase() + result.slice(1);
            return (
              <th
                key={value}
                onMouseUp={(e) => changeSortValue(value, e, mouseDownX, 'edge')}
                onMouseDown={(e) => { mouseDownX = e.clientX; }}
                className={sortNodesBy === value ? `show-arrow${nodesReversed ? ' reverse' : ''}` : null}
              >
                {titleCaseValue === 'Id' ? 'ID' : titleCaseValue}
              </th>
            );
          })}
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
