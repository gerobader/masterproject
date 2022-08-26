/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, {useEffect, useState, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Pagination from '../Pagination/Pagination';
import {setSelectedEdges, setSelectedNodes} from '../../../../../redux/network/network.actions';
import {titleCase} from '../../../../utility';

import './EdgeTable.scss';

let mouseDownX = 0;
let lastSelectedIndex;

const EdgeTable = ({changeSortValue, edgesToShow}) => {
  const {
    selectedNodes, selectedEdges, sortEdgesBy, edgesReversed
  } = useSelector((state) => state.network);
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const visibleEdges = edgesToShow.length <= 100 ? edgesToShow : edgesToShow.slice((page - 1) * 100, page * 100);
  const tableWrapper = useRef();

  useEffect(() => {
    if (selectedEdges.length === 0) lastSelectedIndex = undefined;
  }, [selectedEdges]);

  useEffect(() => {
    tableWrapper.current.scrollTop = 0;
    lastSelectedIndex = undefined;
  }, [page]);

  /**
   * select an edge by clicking on it in the table
   * @param e - the click event
   * @param edge - the edge to select
   * @param index - index of the edge in to edge table - used for multi select
   */
  const selectEdges = (e, edge, index) => {
    if (!edge.visible) return;
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

  /**
   * select a node by clicking on it in the table
   * @param e - the click event
   * @param node - the node to select
   */
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
    <div className="table-wrapper" ref={tableWrapper}>
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
          {visibleEdges.map((edge, index) => (
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
      <Pagination activePage={page} pageCount={Math.ceil(edgesToShow.length / 100)} setPage={setPage}/>
    </div>
  );
};

export default EdgeTable;
