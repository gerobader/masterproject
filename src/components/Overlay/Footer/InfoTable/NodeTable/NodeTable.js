import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setNodes, setSelectedEdges, setSelectedNodes} from '../../../../../redux/network/network.actions';
import {titleCase} from '../../../../utility';

import './NodeTable.scss';

let mouseDownX = 0;

const NodeTable = ({changeSortValue, nodesToShow}) => {
  const {
    nodes, selectedNodes, sortNodesBy, nodesReversed
  } = useSelector((state) => state.network);
  const dispatch = useDispatch();
  const additionalKeys = nodesToShow.length ? Object.keys(nodesToShow[0].data) : [];
  return (
    <table>
      <thead>
        <tr>
          {['id', 'name', 'size', 'color', 'visible', ...additionalKeys].map((value) => {
            const titleCaseValue = titleCase(value);
            let displayName = titleCaseValue;
            if (titleCaseValue === 'Id') {
              displayName = 'ID';
            } else if (titleCaseValue === 'Lcc') {
              displayName = 'LCC';
            }
            return (
              <th
                key={value}
                onMouseUp={(e) => changeSortValue(value, e, mouseDownX, 'node')}
                onMouseDown={(e) => { mouseDownX = e.clientX; }}
                className={sortNodesBy === value ? `show-arrow${nodesReversed ? ' reverse' : ''}` : null}
                title={displayName === 'LCC' ? 'Local Clustering Coefficient' : undefined}
              >
                {displayName}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {nodesToShow.map((node) => (
          <tr
            onClick={(e) => {
              if (e.target.classList[0] !== 'extra-button' && node.visible) {
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
            className={`${selectedNodes.includes(node) ? 'selected' : ''}${!node.visible ? ' gray-out' : ''}`}
            key={node.id}
          >
            <td>{node.id}</td>
            <td>{node.name}</td>
            <td>{node.size}</td>
            <td>
              {node.color}
              <div
                className={`extra-button lock${node.colorLocked ? ' show' : ''}`}
                onClick={() => {
                  node.setColorLock(!node.colorLocked);
                  dispatch(setNodes(nodes));
                }}
              />
            </td>
            <td>
              {node.visible ? 'Yes' : 'No'}
              <div
                className={`extra-button eye show ${node.visible ? 'open' : 'closed'}`}
                onClick={() => {
                  node.setVisibility(!node.visible);
                  dispatch(setNodes(nodes));
                }}
              />
            </td>
            {Object.keys(node.data).map((dataPoint) => (
              <td key={dataPoint}>{Number.isNaN(node.data[dataPoint]) ? 'Path info missing!' : node.data[dataPoint]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default NodeTable;
