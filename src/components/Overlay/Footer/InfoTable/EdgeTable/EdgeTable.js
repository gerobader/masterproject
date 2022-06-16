/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React,{useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setSelectedEdges, setSelectedNodes} from '../../../../../redux/network/network.actions';
import {titleCase} from '../../../../utility';

import './EdgeTable.scss';

let mouseDownX = 0;
let lastSelectedIndex;

const EdgeTable = ({changeSortValue, edgesToShow}) => {
  const {
    selectedNodes, selectedEdges, sortEdgesBy, edgesReversed
  } = useSelector((state) => state.network);
  const {performanceMode} = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedEdges.length === 0) lastSelectedIndex = undefined;
  }, [selectedEdges]);

  const selectEdges = (e, edge, index) => {
    if (!edge.visible || performanceMode) return;
    let newSelectedEdges = [edge];
    if (e.ctrlKey) {
      if (selectedEdges.includes(edge)) {
        newSelectedEdges = selectedEdges.filter((selectedEdge) => selectedEdge.id !== edge.id);
      } else {
        newSelectedEdges = [...selectedEdges, edge];
      }
    } else if (e.shiftKey && lastSelectedIndex !== undefined) {
      newSelectedEdges = new Set(selectedEdges);
      if (lastSelectedIndex < index) {
        for (let i = lastSelectedIndex; i <= index; i++) {
          newSelectedEdges.add(edgesToShow[i]);
        }
      } else if (lastSelectedIndex > index) {
        for (let i = index; i <= lastSelectedIndex; i++) {
          newSelectedEdges.add(edgesToShow[i]);
        }
      }
      newSelectedEdges = Array.from(newSelectedEdges);
    }
    lastSelectedIndex = index;
    dispatch(setSelectedEdges(newSelectedEdges));
  };

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
  const additionalKeys = edgesToShow.length ? Object.keys(edgesToShow[0].data) : [];
  return (
    <table>
      <thead>
        <tr>
          {['id', 'sourceName', 'targetName', 'color', 'size', 'visible', ...additionalKeys].map((value) => {
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
        {edgesToShow.map((edge, index) => (
          <tr className={`${selectedEdges.includes(edge) ? 'selected' : ''}${!edge.visible ? ' gray-out' : ''}`} key={edge.id}>
            <td onClick={(e) => selectEdges(e, edge, index)}>
              {edge.id}
            </td>
            <td
              onClick={(e) => { if (edge.sourceNode.visible) selectNodes(e, edge.sourceNode); }}
              className={
                `node${selectedNodes.includes(edge.sourceNode) ? ' selected' : ''}${edge.sourceNode.visible ? ' visible' : ''}`
              }
            >
              {edge.sourceNode.name}
            </td>
            <td
              onClick={(e) => { if (edge.targetNode.visible) selectNodes(e, edge.targetNode); }}
              className={
                `node${selectedNodes.includes(edge.targetNode) ? ' selected' : ''}${edge.targetNode.visible ? ' visible' : ''}`
              }
            >
              {edge.targetNode.name}
            </td>
            <td onClick={(e) => selectEdges(e, edge, index)}>{edge.color}</td>
            <td onClick={(e) => selectEdges(e, edge, index)}>{edge.size}</td>
            <td onClick={(e) => selectEdges(e, edge, index)}>{edge.visible ? 'Yes' : 'No'}</td>
            {Object.keys(edge.data).map((dataPoint) => (
              <td key={dataPoint} onClick={(e) => selectEdges(e, edge, index)}>{edge.data[dataPoint]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default EdgeTable;
