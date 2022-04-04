import React from 'react';

import './Loader.scss';
import loader from '../../../../assets/loader.png';

const Loader = () => (
  <img alt="loader" className="loader" src={loader}/>
);

export default Loader;
