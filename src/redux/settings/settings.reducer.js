import {
  ADD_TO_ACTION_HISTORY, SET_CAMERA,
  SET_CURRENT_HISTORY_POSITION,
  SET_ORBIT_PREVIEW,
  SET_SHOW_SAVE_NETWORK_MODAL
} from '../actionTypes';

const initialState = {
  orbitPreview: true,
  camera: undefined,
  showSaveNetworkModal: false,
  actionHistory: [],
  currentHistoryPosition: 0
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ORBIT_PREVIEW:
      return {
        ...state,
        orbitPreview: action.payload
      };
    case SET_CAMERA:
      return {
        ...state,
        camera: action.payload
      };
    case SET_SHOW_SAVE_NETWORK_MODAL:
      return {
        ...state,
        showSaveNetworkModal: action.payload
      };
    case ADD_TO_ACTION_HISTORY:
      return {
        ...state,
        actionHistory: [...state.actionHistory.slice(0, state.currentHistoryPosition), action.payload],
        currentHistoryPosition: state.currentHistoryPosition + 1
      };
    case SET_CURRENT_HISTORY_POSITION:
      return {
        ...state,
        currentHistoryPosition: action.payload
      };
    default:
      return state;
  }
};

export default settingsReducer;
