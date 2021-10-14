import {SET_ORBIT_PREVIEW} from '../actionTypes';

const initialState = {
  orbitPreview: true
};

const settingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ORBIT_PREVIEW:
      return {
        ...state,
        orbitPreview: action.payload
      };
    default:
      return state;
  }
};

export default settingsReducer;
