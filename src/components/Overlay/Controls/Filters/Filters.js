import React, {useState, useEffect, useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {v4 as uuidv4} from 'uuid';
import Select from '../../UI/Select/Select';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Button from '../../UI/Button/Button';
import Filter from './Filter/Filter';
import {setNodes, setSelectedNodes} from '../../../../redux/networkElements/networkElements.actions';
import {arrayMove} from '../../../utility';

import './Filters.scss';

const Filters = ({filterCloneSettings, setFilterCloneSettings, setFilterClonePosition}) => {
  const {nodes} = useSelector((state) => state.networkElements);
  const [filterResultType, setFilterResultType] = useState('Select');
  const [hotRefresh, setHotRefresh] = useState(false);
  const [filterType, setFilterType] = useState();
  const [filters, setFilters] = useState([]);
  const [filterCollection, setFilterCollection] = useState({
    type: 'collection',
    operator: 'and',
    id: uuidv4(),
    elements: [
      {
        filterBy: 'name',
        id: uuidv4(),
        position: 0,
        type: 'string',
        selectFunction: 'contains',
        value: ''
      },
      {
        filterBy: 'name',
        id: uuidv4(),
        position: 1,
        type: 'string',
        selectFunction: 'contains',
        value: ''
      },
      {
        type: 'collection',
        id: uuidv4(),
        operator: 'or',
        position: 2,
        elements: [
          {
            filterBy: 'size',
            id: uuidv4(),
            position: 0,
            type: 'number',
            selectFunction: 'is',
            min: 1,
            max: 12
          }
        ]
      }
    ]
  });
  const [currentFilterLocation, setCurrentFilterLocation] = useState();
  const [newFilterLocation, setNewFilterLocation] = useState();
  const dispatch = useDispatch();
  const stringFilterTypes = useMemo(() => {
    if (nodes.length === 0) return [];
    const filterTypes = ['name', 'color'];
    Object.keys(nodes[0].data).forEach((dataPoint) => {
      if (typeof nodes[0].data[dataPoint] === 'string') filterTypes.push(dataPoint);
    });
    return filterTypes;
  }, [nodes]);
  const numberFilterTypes = useMemo(() => {
    if (nodes.length === 0) return [];
    const filterTypes = ['size'];
    Object.keys(nodes[0].data).forEach((dataPoint) => {
      if (typeof nodes[0].data[dataPoint] === 'number') filterTypes.push(dataPoint);
    });
    return filterTypes;
  }, [nodes]);

  const findCollectionElementById = (collection, id) => {
    let result;
    if (id === collection.id) {
      result = collection;
    } else {
      const findById = (elements) => {
        elements.every((element) => {
          if (element.id === id) {
            result = element;
            return false;
          }
          if (element.type === 'collection') {
            findById(element.elements);
          }
          return true;
        });
      };
      findById(collection.elements);
    }
    return result;
  };

  // eslint-disable-next-line no-shadow
  const applyFilters = (filters, resultType) => {
    nodes.forEach((node) => node.setVisibility(true));
    if (filters.length) {
      let finalNodes = [...nodes];
      filters.forEach((filter) => {
        if (filter.type === 'string') {
          finalNodes = finalNodes.filter((node) => {
            const filterDataLocation = filter.filterBy === 'name' || filter.filterBy === 'color' ? node : node.data;
            const nodeValue = filterDataLocation[filter.filterBy].toLowerCase();
            let returnVal = true;
            if (filter.selectFunction === 'contains') returnVal = nodeValue.includes(filter.value.toLowerCase());
            else if (filter.selectFunction === 'doesn\'t contain') returnVal = !(nodeValue.includes(filter.value.toLowerCase()));
            else if (filter.selectFunction === 'is not') returnVal = nodeValue !== filter.value.toLowerCase();
            else if (filter.selectFunction === 'is') returnVal = nodeValue === filter.value.toLowerCase();
            return resultType === 'Show' ? !returnVal : returnVal;
          });
        } else {
          finalNodes = finalNodes.filter((node) => {
            const filterDataLocation = filter.filterBy === 'size' ? node : node.data;
            const nodeValue = filterDataLocation[filter.filterBy];
            let returnVal = true;
            if (filter.selectFunction === 'is not') returnVal = nodeValue > filter.max || nodeValue < filter.min;
            else if (filter.selectFunction === 'is') returnVal = nodeValue <= filter.max && nodeValue >= filter.min;
            return resultType === 'Show' ? !returnVal : returnVal;
          });
        }
      });
      if (resultType === 'Select') {
        dispatch(setSelectedNodes(finalNodes));
      } else {
        finalNodes.forEach((node) => node.setVisibility(false));
      }
    }
    dispatch(setNodes(nodes));
  };

  const moveFilter = () => {
    if (currentFilterLocation !== newFilterLocation) {
      const newFilterCollection = {...filterCollection};
      const collection = findCollectionElementById(newFilterCollection, newFilterLocation.collectionId);
      if (currentFilterLocation.collectionId === newFilterLocation.collectionId) {
        if (currentFilterLocation.position < newFilterLocation.position) {
          collection.elements = arrayMove(collection.elements, currentFilterLocation.position, newFilterLocation.position - 1);
        } else {
          collection.elements = arrayMove(collection.elements, currentFilterLocation.position, newFilterLocation.position);
        }
      } else {
        const elementToMove = findCollectionElementById(newFilterCollection, currentFilterLocation.elementId);
        const oldParentCollection = findCollectionElementById(newFilterCollection, currentFilterLocation.collectionId);
        collection.elements.push(elementToMove);
        collection.elements = arrayMove(collection.elements, collection.elements.length - 1, newFilterLocation.position);
        oldParentCollection.elements = oldParentCollection.elements.filter((element) => (element.id !== elementToMove.id));
        oldParentCollection.elements.forEach((element, index) => oldParentCollection.elements[index].position = index);
      }
      collection.elements.forEach((element, index) => collection.elements[index].position = index);
      // if (hotRefresh) applyFilters(newFilters, filterResultType);
      setFilterCollection(newFilterCollection);
    }
    setNewFilterLocation(-1);
  };

  useEffect(() => {
    if (!filterCloneSettings && newFilterLocation !== -1) {
      moveFilter();
    }
  }, [filterCloneSettings, newFilterLocation]);

  const addFilter = () => {
    if (!filterType) return;
    const filter = {};
    filter.filterBy = filterType;
    filter.id = uuidv4();
    filter.position = filterCollection.elements.length;
    if (stringFilterTypes.includes(filterType)) {
      filter.type = 'string';
      filter.selectFunction = 'contains';
      filter.value = '';
    } else {
      const dataRange = nodes.map((node) => (filterType === 'size' ? node.size : node.data[filterType]));
      filter.type = 'number';
      filter.selectFunction = 'is';
      filter.min = Math.min(...dataRange);
      filter.max = Math.max(...dataRange);
    }
    const newFilterCollection = {...filterCollection, elements: [...filterCollection.elements, filter]};
    // if (hotRefresh) applyFilters(newFilters, filterResultType);
    setFilterCollection(newFilterCollection);
  };

  const updateCollectionElement = (id, newElement) => {
    const newFilterCollection = {...filterCollection};
    const elementToUpdate = findCollectionElementById(newFilterCollection, id);
    Object.keys(newElement).forEach((attribute) => { elementToUpdate[attribute] = newElement[attribute]; });
    setFilterCollection(newFilterCollection);
  };

  const removeElementFromCollection = (collectionId, elementId) => {
    const newFilterCollection = {...filterCollection};
    const collection = findCollectionElementById(newFilterCollection, collectionId);
    collection.elements = collection.elements.filter((element) => (element.id !== elementId));
    collection.elements.forEach((element, index) => collection.elements[index].position = index);
    setFilterCollection(newFilterCollection);
  };

  const updateNewFilterLocation = (index) => {
    if (filterCloneSettings) {
      setNewFilterLocation(index);
    }
  };

  const updateFilterResultType = (type) => {
    if (filterResultType === 'Select' && type === 'Show') dispatch(setSelectedNodes([]));
    setFilterResultType(type);
    if (hotRefresh) applyFilters(filters, type);
  };

  const updateHotRefresh = (enabled) => {
    setHotRefresh(enabled);
    applyFilters(filters, filterResultType);
  };

  const renderFilterCollection = (collection, parentCollection) => (
    <div className="collection-wrapper" key={collection.id}>
      <div className="collection">
        <Select
          options={['and', 'or']}
          value={collection.operator}
          setSelected={(value) => updateCollectionElement(collection.id, {...collection, operator: value})}
          alwaysShowArrow
          titleCaseOptions
        />
        <div className="element-wrapper">
          <div
            className={`hover-indicator-wrapper${filterCloneSettings ? ' active' : ''}`}
            onMouseEnter={() => updateNewFilterLocation({collectionId: collection.id, position: 0})}
            onMouseLeave={() => updateNewFilterLocation(-1)}
          >
            <div className="indicator"/>
          </div>
          {collection.elements.map((element) => {
            if (element.type === 'collection') return renderFilterCollection(element, collection);
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
                />
                <div
                  className={`hover-indicator-wrapper${filterCloneSettings ? ' active' : ''}`}
                  onMouseEnter={() => updateNewFilterLocation({collectionId: collection.id, position: element.position + 1})}
                  onMouseLeave={() => updateNewFilterLocation(-1)}
                >
                  <div className="indicator"/>
                </div>
              </div>
            );
          })}
        </div>
        <div className="add-filter-wrapper">
          <div className="add-button" onClick={addFilter}/>
          <Select
            options={[...stringFilterTypes, ...numberFilterTypes]}
            defaultOption="- Select -"
            alwaysShowArrow
            value={filterType}
            setSelected={setFilterType}
            titleCaseOptions
          />
        </div>
      </div>
      {parentCollection && (
        <div
          className={`hover-indicator-wrapper${filterCloneSettings ? ' active' : ''}`}
          onMouseEnter={() => updateNewFilterLocation(
            {collectionId: parentCollection.id, position: collection.position + 1}
          )}
          onMouseLeave={() => updateNewFilterLocation(-1)}
        >
          <div className="indicator"/>
        </div>
      )}
    </div>
  );

  return (
    <div className="filters-container">
      <div className="filters-wrapper">
        {renderFilterCollection(filterCollection)}
      </div>
      <div className="controls">
        <Select
          options={['Select', 'Show']}
          value={filterResultType}
          setSelected={updateFilterResultType}
          opensUp
          alwaysShowArrow
        />
        <Checkbox
          name="hot-refresh"
          text="Hot refresh"
          checked={hotRefresh}
          setChecked={updateHotRefresh}
        />
        <Button text="Apply" onClick={() => applyFilters(filters, filterResultType)}/>
      </div>
    </div>
  );
};

export default Filters;
