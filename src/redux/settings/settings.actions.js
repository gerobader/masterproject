import {
  ADD_TO_ACTION_HISTORY,
  SET_KEYBOARD_INPUTS_BLOCKED,
  SET_CAMERA_CONTROLS,
  SET_CURRENT_HISTORY_POSITION,
  SET_ORBIT_PREVIEW,
  SET_SHOW_CONTROLS_MODAL,
  SET_SHOW_SAVE_NETWORK_MODAL,
  SET_SHOW_LOAD_NETWORK_MODAL,
  SET_SHOW_LABEL,
  RESET_ACTION_HISTORY,
  SET_PERFORMANCE_MODE,
  SET_BOUNDARY,
  SHOW_BOUNDARY,
  SET_BOUNDARY_OPACITY,
  SET_LAYOUT_CALCULATION_RUNNING,
  SET_AXES,
  SET_SHOW_AXES,
  SET_ERROR_MESSAGE
} from '../actionTypes';
import {setNodes} from '../network/network.actions';
import {setFilterCollection} from '../filter/filter.action';
import {calculateAveragePosition} from '../../components/utility';

export const setOrbitPreview = (state) => ({
  type: SET_ORBIT_PREVIEW,
  payload: state
});

export const setPerformanceMode = (active) => ({
  type: SET_PERFORMANCE_MODE,
  payload: active
});

export const setCameraControls = (cameraControls) => ({
  type: SET_CAMERA_CONTROLS,
  payload: cameraControls
});

export const setShowLabel = (labelState) => ({
  type: SET_SHOW_LABEL,
  payload: labelState
});

export const setShowSaveNetworkModal = (show) => ({
  type: SET_SHOW_SAVE_NETWORK_MODAL,
  payload: show
});

export const setShowLoadNetworkModal = (show) => ({
  type: SET_SHOW_LOAD_NETWORK_MODAL,
  payload: show
});

export const setShowControlsModal = (show) => ({
  type: SET_SHOW_CONTROLS_MODAL,
  payload: show
});

export const setErrorMessage = (errorMessage) => ({
  type: SET_ERROR_MESSAGE,
  payload: errorMessage
});

export const setLayoutCalculationRunning = (running) => ({
  type: SET_LAYOUT_CALCULATION_RUNNING,
  payload: running
});

export const resetActionHistory = () => ({
  type: RESET_ACTION_HISTORY
});

export const addToActionHistory = (action) => ({
  type: ADD_TO_ACTION_HISTORY,
  payload: action
});

export const setCurrentHistoryPosition = (position) => ({
  type: SET_CURRENT_HISTORY_POSITION,
  payload: position
});

export const undoAction = () => (dispatch, getState) => {
  const {actionHistory, currentHistoryPosition} = getState().settings;
  const {
    averagePositionPlaceholder, nodes, selectedNodes, elementGroup
  } = getState().network;
  if (currentHistoryPosition > 0) {
    const actionsToUndo = actionHistory[currentHistoryPosition - 1];
    actionsToUndo.forEach((action) => {
      if (action.type === 'graphElement') {
        const actionTypes = Object.keys(action);
        actionTypes.forEach((actionType) => {
          if (typeof action.element[actionType] === 'function') {
            action.element[actionType](action[actionType].before);
          }
        });
      } else if (action.type === 'filterChange') {
        dispatch(setFilterCollection(action.before));
      }
    });
    if (averagePositionPlaceholder) {
      const averagePosition = calculateAveragePosition(selectedNodes, elementGroup);
      averagePositionPlaceholder.position.set(averagePosition.x, averagePosition.y, averagePosition.z);
    }
    dispatch(setCurrentHistoryPosition(currentHistoryPosition - 1));
    dispatch(setNodes(nodes));
  }
};

export const redoAction = () => (dispatch, getState) => {
  const {actionHistory, currentHistoryPosition} = getState().settings;
  const {
    averagePositionPlaceholder, nodes, selectedNodes, elementGroup
  } = getState().network;
  if (currentHistoryPosition < actionHistory.length) {
    const actionsToRedo = actionHistory[currentHistoryPosition];
    actionsToRedo.forEach((action) => {
      if (action.type === 'graphElement') {
        const actionTypes = Object.keys(action);
        actionTypes.forEach((actionType) => {
          if (typeof action.element[actionType] === 'function') {
            action.element[actionType](action[actionType].after);
          }
        });
      } else if (action.type === 'filterChange') {
        dispatch(setFilterCollection(action.after));
      }
    });
    if (averagePositionPlaceholder) {
      const averagePosition = calculateAveragePosition(selectedNodes, elementGroup);
      averagePositionPlaceholder.position.set(averagePosition.x, averagePosition.y, averagePosition.z);
    }
    dispatch(setCurrentHistoryPosition(currentHistoryPosition + 1));
    dispatch(setNodes(nodes));
  }
};

export const setBlockKeyboardInput = (block) => ({
  type: SET_KEYBOARD_INPUTS_BLOCKED,
  payload: block
});

export const setNetworkBoundarySize = (boundarySize) => ({
  type: SET_BOUNDARY,
  payload: boundarySize
});

export const setShowBoundary = (showBoundary) => ({
  type: SHOW_BOUNDARY,
  payload: showBoundary
});

export const setBoundaryOpacity = (opacity) => ({
  type: SET_BOUNDARY_OPACITY,
  payload: opacity
});

const showAxes = (show) => ({
  type: SET_SHOW_AXES,
  payload: show
});

export const setShowAxes = (show) => (dispatch, getState) => {
  const {axes} = getState().settings;
  axes.setVisibility(show);
  dispatch(showAxes(show));
};

export const setAxes = (axes) => ({
  type: SET_AXES,
  payload: axes
});
