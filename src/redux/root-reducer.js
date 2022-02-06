import { combineReducers } from 'redux';

import settingsReducer from './settings/settings.reducer';
import networkElementsReducer from './networkElements/networkElements.reducer';

export default combineReducers({
  settings: settingsReducer,
  networkElements: networkElementsReducer
});
