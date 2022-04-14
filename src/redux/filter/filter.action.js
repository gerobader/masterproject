import {SET_FILTER_COLLECTION} from '../actionTypes';

// eslint-disable-next-line import/prefer-default-export
export const setFilterCollection = (filterCollection) => ({
  type: SET_FILTER_COLLECTION,
  payload: filterCollection
});
