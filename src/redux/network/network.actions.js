import {
  SET_NODES,
  SET_EDGES,
  SET_SELECTED_NODES,
  SET_SELECTED_EDGES,
  SET_SORT_NODES_BY,
  SET_SORT_EDGES_BY,
  SET_NODES_AND_EDGES,
  SET_AVERAGE_POSITION_PLACEHOLDER,
  SET_NETWORK_NAME, SET_NETWORK_STATISTICS
} from '../actionTypes';

export const setNetworkName = (name) => ({
  type: SET_NETWORK_NAME,
  payload: name
});

export const setNetworkStatistics = (diameter, radius, averageGeodesicDistance, averageDegree, reciprocity, density) => ({
  type: SET_NETWORK_STATISTICS,
  diameter,
  radius,
  averageGeodesicDistance,
  averageDegree,
  reciprocity,
  density
});

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

const updateSelectedNodes = (nodes) => ({
  type: SET_SELECTED_NODES,
  payload: nodes
});

export const setSelectedNodes = (selectedNodes) => (dispatch, getState) => {
  const {showLabel} = getState().settings;
  const {nodes} = getState().network;
  if (showLabel === 1) {
    nodes.forEach((node) => node.hideLabel(true));
    selectedNodes.forEach((node) => node.showLabel(true));
  }
  dispatch(setNodes(nodes));
  dispatch(updateSelectedNodes(selectedNodes));
};

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
