import {
  SET_NODES, SET_EDGES, SET_SELECTED_NODES, SET_SELECTED_EDGES, SET_SORT_BY
} from '../actionTypes';
import {sortArray} from '../../components/utility';

const initialState = {
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  sortBy: 'id',
  reversed: false
};

const sortElements = (elements, value) => {
  if (value === 'name') return elements.sort((a, b) => sortArray(a.labelText, b.labelText));
  if (value === 'color') return elements.sort((a, b) => sortArray(a.color, b.color));
  if (value === 'size') return elements.sort((a, b) => a.size - b.size);
  if (elements[0].data[value]) return elements.sort((a, b) => sortArray(a.data[value], b.data[value]));
  return elements.sort((a, b) => a.id - b.id);
};

const networkElementsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_NODES:
      return {
        ...state,
        nodes: sortElements(action.payload, state.sortBy)
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
    case SET_SORT_BY:
      return {
        ...state,
        nodes: action.payload === state.sortBy ? state.nodes.reverse() : sortElements(state.nodes, action.payload),
        sortBy: action.payload,
        reversed: action.payload === state.sortBy && !state.reversed
      };
    default:
      return state;
  }
};

export default networkElementsReducer;
