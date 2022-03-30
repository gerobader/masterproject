import {SET_ORBIT_PREVIEW, SET_SHOW_SAVE_NETWORK_MODAL} from '../actionTypes';

export const setOrbitPreview = (state) => ({
  type: SET_ORBIT_PREVIEW,
  payload: state
});

export const setShowSaveNetworkModal = (show) => ({
  type: SET_SHOW_SAVE_NETWORK_MODAL,
  payload: show
});
