import React from 'react';
import StringDataPointFilter from './StringDataPointFilter/StringDataPointFilter';
import NumberDataPointFilter from './NumberDataPointFilter/NumberDataPointFilter';

import './Filter.scss';

const Filter = ({
  filter, updateFilter, removeFilter, stringFilterTypes, numberFilterTypes, setFilterCloneSettings, filterCloneSettings,
  setFilterClonePosition, setCurrentFilterIndex
}) => {
  const newFilter = {...filter};
  const isMoving = filterCloneSettings ? filterCloneSettings.id === filter.id : false;

  const changeFilterConfig = (filterOption, newVal) => {
    newFilter[filterOption] = newVal;
    updateFilter(newFilter);
  };

  const moveFieldClick = (e) => {
    setCurrentFilterIndex(filter.position);
    setFilterCloneSettings(filter);
    setFilterClonePosition({x: e.clientX, y: e.clientY});
  };

  return (
    <div className={`filter-wrapper${isMoving ? ' moving' : ''}`}>
      <div
        className="move-field"
        onMouseDown={moveFieldClick}
      />
      <div className="input-wrapper">
        {filter.type === 'string' ? (
          <StringDataPointFilter dataPoints={stringFilterTypes} filter={filter} changeFilterConfig={changeFilterConfig}/>
        ) : (
          <NumberDataPointFilter dataPoints={numberFilterTypes} filter={filter} changeFilterConfig={changeFilterConfig}/>
        )}
      </div>
      <div className="remove-button" onClick={() => removeFilter(filter.id)}/>
    </div>
  );
};

export default Filter;
