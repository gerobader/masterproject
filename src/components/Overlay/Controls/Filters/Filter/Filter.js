import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import StringDataPointFilter from './StringDataPointFilter/StringDataPointFilter';
import NumberDataPointFilter from './NumberDataPointFilter/NumberDataPointFilter';

import './Filter.scss';

const Filter = ({
  id, filter, updateFilter, removeFilter
}) => {
  const {nodes} = useSelector((state) => state.networkElements);
  const newFilter = {...filter};
  const stringDataPoints = useMemo(() => {
    if (nodes.length === 0) return [];
    const dataPoints = [];
    Object.keys(nodes[0].data).forEach((dataPoint) => {
      if (typeof nodes[0].data[dataPoint] === 'string') dataPoints.push(dataPoint);
    });
    return dataPoints;
  }, [nodes]);
  const numberDataPoints = useMemo(() => {
    if (nodes.length === 0) return [];
    const dataPoints = [];
    Object.keys(nodes[0].data).forEach((dataPoint) => {
      if (typeof nodes[0].data[dataPoint] === 'number') dataPoints.push(dataPoint);
    });
    return dataPoints;
  }, [nodes]);

  const changeFilterConfig = (filterOption, newVal) => {
    newFilter[filterOption] = newVal;
    updateFilter(id, newFilter);
  };

  return (
    <div className="filter-wrapper">
      <div className="move-field"/>
      <div className="input-wrapper">
        {filter.type === 'string' ? (
          <StringDataPointFilter dataPoints={stringDataPoints} filter={filter} changeFilterConfig={changeFilterConfig}/>
        ) : (
          <NumberDataPointFilter dataPoints={numberDataPoints} filter={filter} changeFilterConfig={changeFilterConfig}/>
        )}
      </div>
      <div className="remove-button" onClick={() => removeFilter(id)}/>
    </div>
  );
};

export default Filter;
