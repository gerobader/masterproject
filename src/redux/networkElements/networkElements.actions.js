import {
  SET_NODES, SET_EDGES, SET_SELECTED_NODES, SET_SELECTED_EDGES, SET_SORT_BY
} from '../actionTypes';

export const setNodes = (nodes) => ({
  type: SET_NODES,
  payload: nodes
});

export const setEdges = (edges) => ({
  type: SET_EDGES,
  payload: edges
});

export const setSelectedNodes = (nodes) => ({
  type: SET_SELECTED_NODES,
  payload: nodes
});

export const setSelectedEdges = (edges) => ({
  type: SET_SELECTED_EDGES,
  payload: edges
});

export const setSortBy = (sortValue) => ({
  type: SET_SORT_BY,
  payload: sortValue
});
