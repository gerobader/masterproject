import React from 'react';
import Select from '../../../../UI/Select/Select';
import SmallNumberInput from '../../../../UI/SmallNumberInput/SmallNumberInput';

import './NumberDataPointFilter.scss';

const NumberDataPointFilter = ({dataPoints, filter, changeFilterConfig}) => {
  const newFilter = {...filter};
  return (
    <>
      <div className="row margin">
        <Select
          options={dataPoints}
          value={newFilter.filterBy}
          setSelected={(value) => changeFilterConfig('filterBy', value)}
          className="datapoint-select"
          alwaysShowArrow
          titleCaseOptions
        />
        <Select
          options={['is', 'is not']}
          value={filter.selectFunction}
          setSelected={(value) => changeFilterConfig('selectFunction', value)}
          className="function-select"
          alwaysShowArrow
        />
      </div>
      <div className="row">
        <span className="text">between</span>
        <SmallNumberInput
          value={filter.min}
          setValue={(value) => changeFilterConfig('min', value)}
        />
        <span className="text">and</span>
        <SmallNumberInput
          value={filter.max}
          setValue={(value) => changeFilterConfig('max', value)}
        />
        <span className="text">inclusive</span>
      </div>
    </>
  );
};

export default NumberDataPointFilter;
