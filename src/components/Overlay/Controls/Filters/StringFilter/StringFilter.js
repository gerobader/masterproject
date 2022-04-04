import React from 'react';
import Select from '../../../UI/Select/Select';

import './StringFilter.scss';

const StringFilter = ({
  id, filter, updateFilter, dataPoints
}) => {
  const newFilter = {...filter};
  console.log(dataPoints);
  const changeFilterConfig = (filterOption, newVal) => {
    newFilter[filterOption] = newVal;
    updateFilter(newFilter);
  };

  return (
    <div className="filter-wrapper">
      <div className="move-field"/>
      <div className="input-wrapper">
        <Select
          options={dataPoints}
          value={newFilter.datapoint}
          setSelected={(value) => changeFilterConfig('datapoint', value)}
          alwaysShowArrow
          titleCaseOptions
        />
      </div>
      <div className="remove-button"/>
    </div>
  );
};

export default StringFilter;
