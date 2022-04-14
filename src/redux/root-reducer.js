import { combineReducers } from 'redux';

import settingsReducer from './settings/settings.reducer';
import networkElementsReducer from './networkElements/networkElements.reducer';
import filterReducer from './filter/filter.reducer';

export default combineReducers({
  settings: settingsReducer,
  networkElements: networkElementsReducer,
  filter: filterReducer
});
