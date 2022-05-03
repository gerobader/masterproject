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
import {sortArray} from '../../components/utility';

const initialState = {
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  averagePositionPlaceholder: undefined,
  sortNodesBy: 'id',
  sortEdgesBy: 'id',
  updateScene: false,
  nodesReversed: false,
  edgesReversed: false
};

const sortElements = (elements, sortValue, reverse = false) => {
  if (sortValue === 'sourceName') return elements.sort((a, b) => sortArray(a.sourceNode.name, b.sourceNode.name, reverse));
  if (sortValue === 'targetName') return elements.sort((a, b) => sortArray(a.targetNode.name, b.targetNode.name, reverse));
  if (sortValue === 'name') return elements.sort((a, b) => sortArray(a.name, b.name, reverse));
  if (sortValue === 'color') return elements.sort((a, b) => sortArray(a.color, b.color, reverse));
  if (sortValue === 'size') return elements.sort((a, b) => (reverse ? b.size - a.size : a.size - b.size));
  if (elements[0].data && elements[0].data[sortValue] !== undefined) {
    return elements.sort((a, b) => sortArray(a.data[sortValue], b.data[sortValue], reverse));
  }
  return elements.sort((a, b) => (reverse ? b.id - a.id : a.id - b.id));
};

const networkElementsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_NODES:
      return {
        ...state,
        nodes: sortElements(action.payload, state.sortNodesBy, state.nodesReversed)
      };
    case SET_EDGES:
      return {
        ...state,
        edges: sortElements(action.payload, state.sortEdgesBy, state.edgesReversed)
      };
    case SET_NODES_AND_EDGES:
      return {
        ...state,
        nodes: action.nodes,
        edges: action.edges,
        updateScene: action.shouldUpdateScene
      };
    case SET_SELECTED_NODES:
      return {
        ...state,
        selectedNodes: action.payload
      };
    case SET_SELECTED_EDGES:
      return {
        ...state,
        selectedEdges: action.payload
      };
    case SET_AVERAGE_POSITION_PLACEHOLDER:
      return {
        ...state,
        averagePositionPlaceholder: action.payload
      };
    case SET_SORT_NODES_BY:
      return {
        ...state,
        nodes: action.payload === state.sortNodesBy ? state.nodes.reverse() : sortElements(state.nodes, action.payload),
        sortNodesBy: action.payload,
        nodesReversed: action.payload === state.sortNodesBy && !state.nodesReversed
      };
    case SET_SORT_EDGES_BY:
      return {
        ...state,
        edges: action.payload === state.sortEdgesBy ? state.edges.reverse() : sortElements(state.edges, action.payload),
        sortEdgesBy: action.payload,
        edgesReversed: action.payload === state.sortEdgesBy && !state.edgesReversed
      };
    default:
      return state;
  }
};

export default networkElementsReducer;
