import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setSelectedEdges, setSelectedNodes} from '../../../../../redux/networkElements/networkElements.actions';

import './EdgeTable.scss';

let mouseDownX = 0;

const EdgeTable = ({changeSortValue, edges}) => {
  const {
    selectedNodes, selectedEdges, sortEdgesBy, reversed
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
          <th
            onMouseUp={(e) => changeSortValue('id', e, mouseDownX, 'edge')}
            onMouseDown={(e) => { mouseDownX = e.clientX; }}
            className={sortEdgesBy === 'id' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
          >
            ID
          </th>
          <th
            onMouseUp={(e) => changeSortValue('sourceName', e, mouseDownX, 'edge')}
            onMouseDown={(e) => { mouseDownX = e.clientX; }}
            className={sortEdgesBy === 'sourceName' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
          >
            Source Name
          </th>
          <th
            onMouseUp={(e) => changeSortValue('targetName', e, mouseDownX, 'edge')}
            onMouseDown={(e) => { mouseDownX = e.clientX; }}
            className={sortEdgesBy === 'targetName' ? `show-arrow${reversed ? ' reverse' : ''}` : null}
          >
            Target Name
          </th>
        </tr>
      </thead>
      <tbody>
        {edges.map((edge) => (
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
              {edge.sourceNode.labelText}
            </td>
            <td
              onClick={(e) => selectNodes(e, edge.targetNode)}
              className={selectedNodes.includes(edge.targetNode) ? 'selected' : null}
            >
              {edge.targetNode.labelText}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EdgeTable;
