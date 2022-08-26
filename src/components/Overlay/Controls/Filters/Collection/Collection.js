import React from 'react';
import Select from '../../../UI/Select/Select';
import Filter from '../Filter/Filter';

import './Collection.scss';

const Collection = ({
  collection, parentCollection, updateCollectionElement, removeElementFromCollection, filterCloneSettings,
  updateNewFilterLocation, stringFilterTypes, numberFilterTypes, setFilterCloneSettings, setFilterClonePosition,
  setCurrentFilterLocation, addFilter
}) => {
  /**
   * sets the selected filter collection for use in the clone version that is displayed at the
   * mouse position while moving it around
   * @param e - the event info
   */
  const moveFieldClick = (e) => {
    setCurrentFilterLocation({collectionId: parentCollection.id, position: collection.position, elementId: collection.id});
    setFilterCloneSettings(collection);
    setFilterClonePosition({x: e.clientX, y: e.clientY});
  };
  const filterTypeSelectOptions = [];
  if (stringFilterTypes) filterTypeSelectOptions.push(...stringFilterTypes);
  if (numberFilterTypes) filterTypeSelectOptions.push(...numberFilterTypes);

  return (
    <>
      <div className={`collection${!parentCollection ? ' is-root' : ''}`}>
        <div className="top-wrapper">
          <div className="left-wrapper">
            {parentCollection && <div className="move-field" onMouseDown={moveFieldClick}/>}
            <Select
              options={['and', 'or']}
              value={collection.operator}
              setSelected={(value) => updateCollectionElement(collection.id, {...collection, operator: value})}
              alwaysShowArrow
              titleCaseOptions
            />
          </div>
          {parentCollection && (
            <div className="remove-button" onClick={() => removeElementFromCollection(parentCollection.id, collection.id)}/>
          )}
        </div>
        <div className="element-wrapper">
          <div
            className={`hover-indicator-wrapper${filterCloneSettings ? ' active' : ''}`}
            onMouseEnter={() => updateNewFilterLocation({collectionId: collection.id, position: 0, groupElements: false})}
            onMouseLeave={() => updateNewFilterLocation(-1)}
          >
            <div className="indicator"/>
          </div>
          {collection.elements.map((element) => {
            if (element.type === 'collection') {
              return (
                <Collection
                  key={element.id}
                  collection={element}
                  parentCollection={collection}
                  updateCollectionElement={updateCollectionElement}
                  removeElementFromCollection={removeElementFromCollection}
                  filterCloneSettings={filterCloneSettings}
                  updateNewFilterLocation={updateNewFilterLocation}
                  stringFilterTypes={stringFilterTypes}
                  numberFilterTypes={numberFilterTypes}
                  setFilterCloneSettings={setFilterCloneSettings}
                  setFilterClonePosition={setFilterClonePosition}
                  setCurrentFilterLocation={setCurrentFilterLocation}
                  addFilter={addFilter}
                />
              );
            }
            return (
              <div key={element.id}>
                <Filter
                  id={element.id}
                  collectionId={collection.id}
                  filter={element}
                  updateFilter={updateCollectionElement}
                  removeFilter={removeElementFromCollection}
                  stringFilterTypes={stringFilterTypes}
                  numberFilterTypes={numberFilterTypes}
                  filterCloneSettings={filterCloneSettings}
                  setFilterCloneSettings={setFilterCloneSettings}
                  setFilterClonePosition={setFilterClonePosition}
                  setCurrentFilterLocation={setCurrentFilterLocation}
                  onMouseEnter={() => updateNewFilterLocation(
                    {collectionId: collection.id, position: element.position, groupElements: true}
                  )}
                  onMouseLeave={() => updateNewFilterLocation(-1)}
                />
                <div
                  className={`hover-indicator-wrapper${filterCloneSettings ? ' active' : ''}`}
                  onMouseEnter={() => updateNewFilterLocation(
                    {collectionId: collection.id, position: element.position + 1, groupElements: false}
                  )}
                  onMouseLeave={() => updateNewFilterLocation(-1)}
                >
                  <div className="indicator"/>
                </div>
              </div>
            );
          })}
        </div>
        <div className="add-filter-wrapper">
          <div className="add-button" onClick={() => addFilter(collection.id)}/>
          <Select
            options={filterTypeSelectOptions}
            defaultOption="- Select -"
            alwaysShowArrow
            value={collection.filterSelectType}
            setSelected={(value) => updateCollectionElement(collection.id, {...collection, filterSelectType: value})}
            titleCaseOptions
          />
        </div>
      </div>
      {parentCollection && (
        <div
          className={`hover-indicator-wrapper${filterCloneSettings ? ' active' : ''}`}
          onMouseEnter={() => updateNewFilterLocation(
            {collectionId: parentCollection.id, position: collection.position + 1, groupElements: false}
          )}
          onMouseLeave={() => updateNewFilterLocation(-1)}
        >
          <div className="indicator"/>
        </div>
      )}
    </>
  );
};

export default Collection;
