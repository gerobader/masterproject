import {v4 as uuidv4} from 'uuid';
import {SET_FILTER_COLLECTION} from '../actionTypes';

const initialState = {
  filterCollection: {
    type: 'collection',
    operator: 'and',
    id: uuidv4(),
    filterSelectType: '',
    elements: []
  }
};

const filterReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FILTER_COLLECTION:
      return {
        ...state,
        filterCollection: action.payload
      };
    default:
      return state;
  }
};

export default filterReducer;
