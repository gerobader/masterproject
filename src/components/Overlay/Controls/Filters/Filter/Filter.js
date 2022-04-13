import React from 'react';
import StringDataPointFilter from './StringDataPointFilter/StringDataPointFilter';
import NumberDataPointFilter from './NumberDataPointFilter/NumberDataPointFilter';

import './Filter.scss';

const Filter = ({
  id, filter, updateFilter, removeFilter, stringFilterTypes, numberFilterTypes, setFilterCloneSettings, filterCloneSettings,
  setFilterClonePosition, setCurrentFilterLocation, collectionId, onMouseEnter
}) => {
  const newFilter = {...filter};
  const isMoving = filterCloneSettings ? filterCloneSettings.id === filter.id : false;

  const changeFilterConfig = (filterOption, newVal) => {
    newFilter[filterOption] = newVal;
    updateFilter(id, newFilter);
  };

  const moveFieldClick = (e) => {
    setCurrentFilterLocation({collectionId, position: filter.position, elementId: id});
    setFilterCloneSettings(filter);
    setFilterClonePosition({x: e.clientX, y: e.clientY});
  };

  return (
    <div
      className={`filter-wrapper${isMoving ? ' moving' : ''}${filterCloneSettings ? ' hover-enabled' : ''}`}
      onMouseEnter={onMouseEnter}
    >
      <div className="move-field" onMouseDown={moveFieldClick}/>
      <div className="input-wrapper">
        {filter.type === 'string' ? (
          <StringDataPointFilter dataPoints={stringFilterTypes} filter={filter} changeFilterConfig={changeFilterConfig}/>
        ) : (
          <NumberDataPointFilter dataPoints={numberFilterTypes} filter={filter} changeFilterConfig={changeFilterConfig}/>
        )}
      </div>
      <div className="remove-button" onClick={() => removeFilter(collectionId, filter.id)}/>
    </div>
  );
};

export default Filter;
