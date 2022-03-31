import {
  SET_NODES,
  SET_EDGES,
  SET_SELECTED_NODES,
  SET_SELECTED_EDGES,
  SET_SORT_NODES_BY,
  SET_SORT_EDGES_BY,
  SET_NODES_AND_EDGES,
  SET_AVERAGE_POSITION_PLACEHOLDER
} from '../actionTypes';

export const setNodes = (nodes) => ({
  type: SET_NODES,
  payload: nodes
});

export const setEdges = (edges) => ({
  type: SET_EDGES,
  payload: edges
});

export const setNodesAndEdges = (nodes, edges, shouldUpdateScene) => ({
  type: SET_NODES_AND_EDGES,
  nodes,
  edges,
  shouldUpdateScene
});

export const setSelectedNodes = (nodes) => ({
  type: SET_SELECTED_NODES,
  payload: nodes
});

export const setSelectedEdges = (edges) => ({
  type: SET_SELECTED_EDGES,
  payload: edges
});

export const setAveragePositionPlaceholder = (placeholder) => ({
  type: SET_AVERAGE_POSITION_PLACEHOLDER,
  payload: placeholder
});

export const setSortNodesBy = (sortValue) => ({
  type: SET_SORT_NODES_BY,
  payload: sortValue
});

export const setSortEdgesBy = (sortValue) => ({
  type: SET_SORT_EDGES_BY,
  payload: sortValue
});
