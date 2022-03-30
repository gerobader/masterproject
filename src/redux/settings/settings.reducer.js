import {SET_ORBIT_PREVIEW, SET_SHOW_SAVE_NETWORK_MODAL} from '../actionTypes';

const initialState = {
  orbitPreview: true,
  showSaveNetworkModal: false
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ORBIT_PREVIEW:
      return {
        ...state,
        orbitPreview: action.payload
      };
    case SET_SHOW_SAVE_NETWORK_MODAL:
      return {
        ...state,
        showSaveNetworkModal: action.payload
      };
    default:
      return state;
  }
};

export default settingsReducer;
