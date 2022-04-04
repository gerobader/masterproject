import {
  ADD_TO_ACTION_HISTORY, SET_CAMERA,
  SET_CURRENT_HISTORY_POSITION,
  SET_ORBIT_PREVIEW,
  SET_SHOW_SAVE_NETWORK_MODAL
} from '../actionTypes';

export const setOrbitPreview = (state) => ({
  type: SET_ORBIT_PREVIEW,
  payload: state
});

export const setCamera = (camera) => ({
  type: SET_CAMERA,
  payload: camera
});

export const setShowSaveNetworkModal = (show) => ({
  type: SET_SHOW_SAVE_NETWORK_MODAL,
  payload: show
});

export const addToActionHistory = (action) => ({
  type: ADD_TO_ACTION_HISTORY,
  payload: action
});

export const setCurrentHistoryPosition = (position) => ({
  type: SET_CURRENT_HISTORY_POSITION,
  payload: position
});
