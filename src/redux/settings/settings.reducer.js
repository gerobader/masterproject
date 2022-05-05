import {
  ADD_TO_ACTION_HISTORY,
  SET_KEYBOARD_INPUTS_BLOCKED,
  SET_CAMERA,
  SET_CURRENT_HISTORY_POSITION,
  SET_ORBIT_PREVIEW,
  SET_SHOW_CONTROLS_MODAL,
  SET_SHOW_SAVE_NETWORK_MODAL,
  SET_SHOW_LABEL, RESET_ACTION_HISTORY
} from '../actionTypes';

const initialState = {
  orbitPreview: false,
  camera: undefined,
  showLabel: 0, // 0 = hide, 1 = show for selected, 2 = show for all
  showSaveNetworkModal: false,
  showControlsModal: false,
  actionHistory: [],
  currentHistoryPosition: 0,
  keyboardInputsBlocked: false
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
    case SET_SHOW_LABEL:
      return {
        ...state,
        showLabel: action.payload
      };
    case SET_SHOW_SAVE_NETWORK_MODAL:
      return {
        ...state,
        showSaveNetworkModal: action.payload
      };
    case SET_SHOW_CONTROLS_MODAL:
      return {
        ...state,
        showControlsModal: action.payload
      };
    case RESET_ACTION_HISTORY:
      return {
        ...state,
        actionHistory: [],
        currentHistoryPosition: 0
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
    case SET_KEYBOARD_INPUTS_BLOCKED:
      return {
        ...state,
        keyboardInputsBlocked: action.payload
      };
    default:
      return state;
  }
};

export default settingsReducer;
