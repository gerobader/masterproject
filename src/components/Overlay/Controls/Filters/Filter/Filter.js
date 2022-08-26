import React from 'react';
import StringDataPointFilter from './StringDataPointFilter/StringDataPointFilter';
import NumberDataPointFilter from './NumberDataPointFilter/NumberDataPointFilter';

import './Filter.scss';

const Filter = ({
  id, filter, updateFilter, removeFilter, stringFilterTypes, numberFilterTypes, setFilterCloneSettings, filterCloneSettings,
  setFilterClonePosition, setCurrentFilterLocation, collectionId, onMouseEnter, onMouseLeave
}) => {
  const newFilter = {...filter};
  const isMoving = filterCloneSettings ? filterCloneSettings.id === filter.id : false;

  /**
   * calls the updateFilter function to update the filter settings
   * @param filterOption - the part of the filter that should be updated
   * @param newVal - the new value of that filter port
   */
  const changeFilterConfig = (filterOption, newVal) => {
    newFilter[filterOption] = newVal;
    updateFilter(id, newFilter);
  };

  /**
   * sets the selected filter collection for use in the clone version that is displayed at the
   * mouse position while moving it around
   * @param e - the event info
   */
  const moveFieldClick = (e) => {
    setCurrentFilterLocation({collectionId, position: filter.position, elementId: id});
    setFilterCloneSettings(filter);
    setFilterClonePosition({x: e.clientX, y: e.clientY});
  };

  return (
    <div
      className={`filter-wrapper${isMoving ? ' moving' : ''}${filterCloneSettings ? ' hover-enabled' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
