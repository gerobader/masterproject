import { combineReducers } from 'redux';

import settingsReducer from './settings/settings.reducer';
import networkReducer from './network/network.reducer';
import filterReducer from './filter/filter.reducer';

export default combineReducers({
  settings: settingsReducer,
  network: networkReducer,
  filter: filterReducer
});
