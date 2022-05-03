import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// import logger from 'redux-logger';

import rootReducer from './root-reducer';

let middlewares = [];
if (process.env.NODE_ENV === 'development') {
  // middlewares = [...middlewares, logger];
}

const store = createStore(rootReducer, applyMiddleware(...middlewares, thunk));

export default store;
