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
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filterCollection, setFilterCollection] = useState({
    type: 'collection',
    operator: 'and',
    id: uuidv4(),
    filterSelectType: '',
    elements: []
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
  const filterNodes = (nodes, filter, resultType) => {
    let resultNodes = [...nodes];
    if (filter.type === 'string') {
      resultNodes = resultNodes.filter((node) => {
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
      resultNodes = resultNodes.filter((node) => {
        const filterDataLocation = filter.filterBy === 'size' ? node : node.data;
        const nodeValue = filterDataLocation[filter.filterBy];
        let returnVal = true;
        if (filter.selectFunction === 'is not') returnVal = nodeValue > filter.max || nodeValue < filter.min;
        else if (filter.selectFunction === 'is') returnVal = nodeValue <= filter.max && nodeValue >= filter.min;
        return resultType === 'Show' ? !returnVal : returnVal;
      });
    }
    return resultNodes;
  };

  // eslint-disable-next-line no-shadow
  const applyFilters = (filterCollection, resultType) => {
    nodes.forEach((node) => node.setVisibility(true));
    if (filterCollection.elements.length) {
      const applyCollectionFilter = (collection, availableNodes) => {
        let temporaryNodes = [];
        if (collection.operator === 'and') {
          temporaryNodes = [...availableNodes];
          collection.elements.forEach((collectionElement) => {
            if (collectionElement.type === 'collection' && collectionElement.elements.length) {
              temporaryNodes = applyCollectionFilter(collectionElement, temporaryNodes);
            } else {
              temporaryNodes = filterNodes(temporaryNodes, collectionElement, resultType);
            }
          });
        } else {
          collection.elements.forEach((collectionElement) => {
            if (collectionElement.type === 'collection') {
              temporaryNodes = [...temporaryNodes, ...applyCollectionFilter(collectionElement, availableNodes)];
            } else {
              temporaryNodes = [...temporaryNodes, ...filterNodes(availableNodes, collectionElement, resultType)];
            }
          });
          // remove duplicate nodes
          temporaryNodes = [...new Set(temporaryNodes)];
        }
        return temporaryNodes;
      };
      const finalNodes = applyCollectionFilter(filterCollection, nodes);
      if (resultType === 'Select') {
        dispatch(setSelectedNodes(finalNodes));
      } else {
        finalNodes.forEach((node) => node.setVisibility(false));
      }
    }
    dispatch(setNodes(nodes));
  };

  const moveFilter = () => {
    if (currentFilterLocation && newFilterLocation && !(
      currentFilterLocation.position === newFilterLocation.position
      && currentFilterLocation.collectionId === newFilterLocation.collectionId
    )) {
      const newFilterCollection = {...filterCollection};
      const collection = findCollectionElementById(newFilterCollection, newFilterLocation.collectionId);
      if (newFilterLocation.groupElements) {
        // get the 2 filters
        const sourceCollection = findCollectionElementById(newFilterCollection, currentFilterLocation.collectionId);
        const targetFilter = {...collection.elements[newFilterLocation.position], position: 0};
        const sourceFilter = {...sourceCollection.elements[currentFilterLocation.position], position: 1};
        // create collection with the 2 filters
        const newCollection = {
          type: 'collection',
          id: uuidv4(),
          operator: 'and',
          position: targetFilter.position,
          filterSelectType: '',
          elements: [targetFilter, sourceFilter]
        };
        // add collection in place of the target filter
        collection.elements.push(newCollection);
        collection.elements = arrayMove(collection.elements, collection.elements.length - 1, newFilterLocation.position);
        // remove the two filters from their parent collections
        sourceCollection.elements = sourceCollection.elements.filter((element) => (element.id !== sourceFilter.id));
        sourceCollection.elements.forEach((element, index) => sourceCollection.elements[index].position = index);
        collection.elements = collection.elements.filter((element) => (element.id !== targetFilter.id));
        collection.elements.forEach((element, index) => collection.elements[index].position = index);
      } else if (currentFilterLocation.collectionId === newFilterLocation.collectionId) {
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
      if (autoRefresh) applyFilters(newFilterCollection, filterResultType);
      setFilterCollection(newFilterCollection);
    }
    setNewFilterLocation(-1);
  };

  useEffect(() => {
    if (!filterCloneSettings && newFilterLocation !== -1) {
      moveFilter();
    }
  }, [filterCloneSettings, newFilterLocation]);

  const addFilter = (collectionId) => {
    const newFilterCollection = {...filterCollection};
    const collection = findCollectionElementById(newFilterCollection, collectionId);
    const {filterSelectType, elements} = collection;
    if (!filterSelectType) return;
    const filter = {};
    filter.filterBy = filterSelectType;
    filter.id = uuidv4();
    filter.position = elements.length;
    if (stringFilterTypes.includes(filterSelectType)) {
      filter.type = 'string';
      filter.selectFunction = 'contains';
      filter.value = '';
    } else {
      const dataRange = nodes.map((node) => (filterSelectType === 'size' ? node.size : node.data[filterSelectType]));
      filter.type = 'number';
      filter.selectFunction = 'is';
      filter.min = Math.min(...dataRange);
      filter.max = Math.max(...dataRange);
    }
    collection.elements.push(filter);
    if (autoRefresh) applyFilters(newFilterCollection, filterResultType);
    setFilterCollection(newFilterCollection);
  };

  const updateCollectionElement = (id, newElement) => {
    const newFilterCollection = {...filterCollection};
    const elementToUpdate = findCollectionElementById(newFilterCollection, id);
    Object.keys(newElement).forEach((attribute) => { elementToUpdate[attribute] = newElement[attribute]; });
    if (autoRefresh) applyFilters(newFilterCollection, filterResultType);
    setFilterCollection(newFilterCollection);
  };

  const removeElementFromCollection = (collectionId, elementId) => {
    const newFilterCollection = {...filterCollection};
    const collection = findCollectionElementById(newFilterCollection, collectionId);
    collection.elements = collection.elements.filter((element) => (element.id !== elementId));
    collection.elements.forEach((element, index) => collection.elements[index].position = index);
    if (autoRefresh) applyFilters(newFilterCollection, filterResultType);
    setFilterCollection(newFilterCollection);
  };

  const updateNewFilterLocation = (locationSettings) => {
    if (filterCloneSettings) {
      setNewFilterLocation(locationSettings);
    }
  };

  const updateFilterResultType = (type) => {
    if (filterResultType === 'Select' && type === 'Show') dispatch(setSelectedNodes([]));
    setFilterResultType(type);
    if (autoRefresh) applyFilters(filterCollection, type);
  };

  const updateAutoRefresh = (enabled) => {
    setAutoRefresh(enabled);
    applyFilters(filterCollection, filterResultType);
  };

  const renderFilterCollection = (collection, parentCollection) => (
    <div key={collection.id}>
      <div className="collection">
        <div className="top-wrapper">
          <Select
            options={['and', 'or']}
            value={collection.operator}
            setSelected={(value) => updateCollectionElement(collection.id, {...collection, operator: value})}
            alwaysShowArrow
            titleCaseOptions
          />
          {parentCollection && (
            <div className="remove-button" onClick={() => removeElementFromCollection(parentCollection.id, collection.id)}/>
          )}
        </div>
        <div className="element-wrapper">
          <div
            className={`hover-indicator-wrapper${filterCloneSettings ? ' active' : ''}`}
            onMouseEnter={() => updateNewFilterLocation({collectionId: collection.id, position: 0, groupElements: false})}
            // onMouseLeave={() => updateNewFilterLocation(-1)}
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
                  onMouseEnter={() => updateNewFilterLocation(
                    {collectionId: collection.id, position: element.position, groupElements: true}
                  )}
                  // onMouseLeave={() => updateNewFilterLocation(-1)}
                />
                <div
                  className={`hover-indicator-wrapper${filterCloneSettings ? ' active' : ''}`}
                  onMouseEnter={() => updateNewFilterLocation(
                    {collectionId: collection.id, position: element.position + 1, groupElements: false}
                  )}
                  // onMouseLeave={() => updateNewFilterLocation(-1)}
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
            options={[...stringFilterTypes, ...numberFilterTypes]}
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
          // onMouseLeave={() => updateNewFilterLocation(-1)}
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
          name="auto-refresh"
          text="Auto refresh"
          checked={autoRefresh}
          setChecked={updateAutoRefresh}
        />
        <Button text="Apply" onClick={() => applyFilters(filterCollection, filterResultType)}/>
      </div>
    </div>
  );
};

export default Filters;
