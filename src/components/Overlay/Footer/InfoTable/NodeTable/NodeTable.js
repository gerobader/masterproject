import React, {useState, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Pagination from '../Pagination/Pagination';
import {setNodes, setSelectedEdges, setSelectedNodes} from '../../../../../redux/network/network.actions';
import {titleCase} from '../../../../utility';

import './NodeTable.scss';

let mouseDownX = 0;
let lastSelectedIndex;

const NodeTable = ({changeSortValue, nodesToShow}) => {
  const {
    nodes, selectedNodes, sortNodesBy, nodesReversed
  } = useSelector((state) => state.network);
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const additionalKeys = nodesToShow.length ? Object.keys(nodesToShow[0].data) : [];
  const visibleNodes = nodesToShow.length <= 100 ? nodesToShow : nodesToShow.slice((page - 1) * 100, page * 100);
  const tableWrapper = useRef();

  useEffect(() => {
    if (selectedNodes.length === 0) lastSelectedIndex = undefined;
  }, [selectedNodes]);

  useEffect(() => {
    tableWrapper.current.scrollTop = 0;
    lastSelectedIndex = undefined;
  }, [page]);

  const selectNodes = (e, node, index) => {
    if (e.target.classList[0] !== 'extra-button' && node.visible) {
      let newSelectedNodes = [node];
      if (e.ctrlKey) {
        if (selectedNodes.includes(node)) {
          newSelectedNodes = selectedNodes.filter((selectedNode) => selectedNode.id !== node.id);
        } else {
          newSelectedNodes = [...selectedNodes, node];
        }
      } else if (e.shiftKey && lastSelectedIndex !== undefined) {
        newSelectedNodes = new Set(selectedNodes);
        if (lastSelectedIndex < index) {
          for (let i = lastSelectedIndex; i <= index; i++) {
            newSelectedNodes.add(nodesToShow[i]);
          }
        } else if (lastSelectedIndex > index) {
          for (let i = index; i <= lastSelectedIndex; i++) {
            newSelectedNodes.add(nodesToShow[i]);
          }
        }
        newSelectedNodes = Array.from(newSelectedNodes);
      }
      lastSelectedIndex = index;
      dispatch(setSelectedNodes(newSelectedNodes));
      dispatch(setSelectedEdges([]));
    }
  };

  return (
    <div className="table-wrapper" ref={tableWrapper}>
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
          {visibleNodes.map((node, index) => (
            <tr
              onClick={(e) => selectNodes(e, node, index)}
              className={`${selectedNodes.includes(node) ? 'selected' : ''}${!node.visible ? ' gray-out' : ''}`}
              key={node.id}
            >
              <td>{node.id}</td>
              <td style={{userSelect: 'all'}} className="max-width big">{node.name}</td>
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
                    if (selectedNodes.includes(node)) {
                      const newSelectedNodes = selectedNodes.filter((selectedNode) => selectedNode.id !== node.id);
                      dispatch(setSelectedNodes(newSelectedNodes));
                    }
                    dispatch(setNodes(nodes));
                  }}
                />
              </td>
              {Object.keys(node.data).map((dataPoint) => (
                <td key={dataPoint} className="max-width">
                  {/* eslint-disable-next-line no-restricted-globals */}
                  {(!isNaN(node.data[dataPoint]))
                    ? Math.round(node.data[dataPoint] * 1000000) / 1000000
                    : node.data[dataPoint]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination activePage={page} pageCount={Math.ceil(nodesToShow.length / 100)} setPage={setPage}/>
    </div>
  );
};

export default NodeTable;
