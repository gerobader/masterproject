import {
  SET_NODES, SET_EDGES, SET_SELECTED_NODES, SET_SELECTED_EDGES
} from '../actionTypes';

const initialState = {
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: []
};

const networkElementsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_NODES:
      return {
        ...state,
        nodes: action.payload
      };
    case SET_EDGES:
      return {
        ...state,
        edges: action.payload
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
    default:
      return state;
  }
};

export default networkElementsReducer;
