import React from 'react';
import Select from '../../../../UI/Select/Select';
import TextInput from '../../../../UI/TextInput/TextInput';

import './StringDataPointFilter.scss';

const StringDataPointFilter = ({
  filter, changeFilterConfig, dataPoints
}) => {
  const newFilter = {...filter};

  return (
    <>
      <div className="user-select">
        <Select
          options={dataPoints}
          value={newFilter.filterBy}
          setSelected={(value) => changeFilterConfig('dataPoint', value)}
          className="datapoint-select"
          alwaysShowArrow
          titleCaseOptions
        />
        <Select
          options={['contains', 'doesn\'t contain', 'is', 'is not']}
          value={filter.selectFunction}
          setSelected={(value) => changeFilterConfig('selectFunction', value)}
          className="function-select"
          alwaysShowArrow
        />
      </div>
      <TextInput
        value={filter.value}
        setValue={(value) => changeFilterConfig('value', value)}
        placeholder="Filtervalue"
      />
    </>
  );
};

export default StringDataPointFilter;
