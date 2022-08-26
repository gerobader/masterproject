import {
  ADD_TO_ACTION_HISTORY,
  SET_KEYBOARD_INPUTS_BLOCKED,
  SET_CAMERA_CONTROLS,
  SET_CURRENT_HISTORY_POSITION,
  SET_ORBIT_PREVIEW,
  SET_SHOW_CONTROLS_MODAL,
  SET_SHOW_SAVE_NETWORK_MODAL,
  SET_SHOW_LABEL,
  RESET_ACTION_HISTORY,
  SET_PERFORMANCE_MODE,
  SET_BOUNDARY,
  SHOW_BOUNDARY,
  SET_BOUNDARY_OPACITY,
  SET_LAYOUT_CALCULATION_RUNNING,
  SET_SHOW_LOAD_NETWORK_MODAL,
  SET_AXES,
  SET_SHOW_AXES,
  SET_ERROR_MESSAGE
} from '../actionTypes';

const initialState = {
  orbitPreview: false,
  performanceMode: false,
  cameraControls: undefined,
  showLabel: 0, // 0 = hide, 1 = show for selected, 2 = show for all
  showSaveNetworkModal: false,
  showLoadNetworkModal: true,
  showControlsModal: false,
  errorMessage: undefined,
  layoutCalculationRunning: false,
  actionHistory: [],
  currentHistoryPosition: 0,
  keyboardInputsBlocked: false,
  networkBoundarySize: 100,
  showBoundary: false,
  boundaryOpacity: 0.3,
  showAxes: false,
  axes: undefined
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ORBIT_PREVIEW:
      return {
        ...state,
        orbitPreview: action.payload
      };
    case SET_PERFORMANCE_MODE:
      return {
        ...state,
        performanceMode: action.payload
      };
    case SET_CAMERA_CONTROLS:
      return {
        ...state,
        cameraControls: action.payload
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
    case SET_SHOW_LOAD_NETWORK_MODAL:
      return {
        ...state,
        showLoadNetworkModal: action.payload
      };
    case SET_SHOW_CONTROLS_MODAL:
      return {
        ...state,
        showControlsModal: action.payload
      };
    case SET_ERROR_MESSAGE:
      return {
        ...state,
        errorMessage: action.payload
      };
    case SET_LAYOUT_CALCULATION_RUNNING:
      return {
        ...state,
        layoutCalculationRunning: action.payload
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
    case SET_BOUNDARY:
      return {
        ...state,
        networkBoundarySize: action.payload
      };
    case SHOW_BOUNDARY:
      return {
        ...state,
        showBoundary: action.payload
      };
    case SET_BOUNDARY_OPACITY:
      return {
        ...state,
        boundaryOpacity: action.payload
      };
    case SET_SHOW_AXES:
      return {
        ...state,
        showAxes: action.payload
      };
    case SET_AXES:
      return {
        ...state,
        axes: action.payload
      };
    default:
      return state;
  }
};

export default settingsReducer;
