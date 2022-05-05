import {
  ADD_TO_ACTION_HISTORY,
  SET_KEYBOARD_INPUTS_BLOCKED,
  SET_CAMERA,
  SET_CURRENT_HISTORY_POSITION,
  SET_ORBIT_PREVIEW,
  SET_SHOW_CONTROLS_MODAL,
  SET_SHOW_SAVE_NETWORK_MODAL, SET_SHOW_LABEL, RESET_ACTION_HISTORY
} from '../actionTypes';

export const setOrbitPreview = (state) => ({
  type: SET_ORBIT_PREVIEW,
  payload: state
});

export const setCamera = (camera) => ({
  type: SET_CAMERA,
  payload: camera
});

export const setShowLabel = (labelState) => ({
  type: SET_SHOW_LABEL,
  payload: labelState
});

export const setShowSaveNetworkModal = (show) => ({
  type: SET_SHOW_SAVE_NETWORK_MODAL,
  payload: show
});

export const setShowControlsModal = (show) => ({
  type: SET_SHOW_CONTROLS_MODAL,
  payload: show
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

export const setBlockKeyboardInput = (block) => ({
  type: SET_KEYBOARD_INPUTS_BLOCKED,
  payload: block
});
