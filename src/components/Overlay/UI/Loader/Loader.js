import React from 'react';

import './Loader.scss';
import loader from '../../../../assets/loader.png';

const Loader = () => {
  return (
    <img alt="loader" className="loader" src={loader}/>
  );
};

export default Loader;
