import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import NetworkVisualizer from './container/NetworkVisualizer';
import store from './redux/store';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <NetworkVisualizer/>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
