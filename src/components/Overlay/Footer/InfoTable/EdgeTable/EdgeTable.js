/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setSelectedEdges, setSelectedNodes} from '../../../../../redux/networkElements/networkElements.actions';
import {titleCase} from '../../../../utility';

import './EdgeTable.scss';

let mouseDownX = 0;

const EdgeTable = ({changeSortValue, edgesToShow}) => {
  const {
    selectedNodes, selectedEdges, sortEdgesBy, edgesReversed
  } = useSelector((state) => state.networkElements);
  const dispatch = useDispatch();

  const selectNodes = (e, node) => {
    let newSelectedNodes = [node];
    if (e.ctrlKey) {
      if (selectedNodes.includes(node)) {
        newSelectedNodes = selectedNodes.filter((selectedNode) => selectedNode.id !== node.id);
      } else {
        newSelectedNodes = [...selectedNodes, node];
      }
    }
    dispatch(setSelectedNodes(newSelectedNodes));
  };

  return (
    <table>
      <thead>
        <tr>
          {['id', 'sourceName', 'targetName', 'color', 'size', 'visible'].map((value) => {
            const titleCaseValue = titleCase(value);
            return (
              <th
                key={value}
                onMouseUp={(e) => changeSortValue(value, e, mouseDownX, 'edge')}
                onMouseDown={(e) => { mouseDownX = e.clientX; }}
                className={sortEdgesBy === value ? `show-arrow${edgesReversed ? ' reverse' : ''}` : null}
              >
                {titleCaseValue === 'Id' ? 'ID' : titleCaseValue}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {edgesToShow.map((edge) => (
          <tr className={selectedEdges.includes(edge) ? 'selected' : ''} key={edge.id}>
            <td
              onClick={(e) => {
                let newSelectedEdges = [edge];
                if (e.ctrlKey) {
                  if (selectedEdges.includes(edge)) {
                    newSelectedEdges = selectedEdges.filter((selectedEdge) => selectedEdge.id !== edge.id);
                  } else {
                    newSelectedEdges = [...selectedEdges, edge];
                  }
                }
                dispatch(setSelectedEdges(newSelectedEdges));
              }}
            >
              {edge.id}
            </td>
            <td
              onClick={(e) => selectNodes(e, edge.sourceNode)}
              className={selectedNodes.includes(edge.sourceNode) ? 'selected' : null}
            >
              {edge.sourceNode.name}
            </td>
            <td
              onClick={(e) => selectNodes(e, edge.targetNode)}
              className={selectedNodes.includes(edge.targetNode) ? 'selected' : null}
            >
              {edge.targetNode.name}
            </td>
            <td>{edge.color}</td>
            <td>{edge.size}</td>
            <td>{edge.visible ? 'Yes' : 'No'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EdgeTable;
