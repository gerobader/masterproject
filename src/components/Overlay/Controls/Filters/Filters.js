import React, {useState, useEffect, useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {v4 as uuidv4} from 'uuid';
import MenuElement from '../../UI/MenuElement/MenuElement';
import Select from '../../UI/Select/Select';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Button from '../../UI/Button/Button';
import Collection from './Collection/Collection';
import {setNodes, setSelectedNodes} from '../../../../redux/network/network.actions';
import {setFilterCollection} from '../../../../redux/filter/filter.action';
import {addToActionHistory} from '../../../../redux/settings/settings.actions';
import {arrayMove} from '../../../utility';

import './Filters.scss';
import filterIcon from '../../../../assets/filter-icon.svg';

const Filters = ({filterCloneSettings, setFilterCloneSettings, setFilterClonePosition}) => {
  const {nodes} = useSelector((state) => state.network);
  const {filterCollection} = useSelector((state) => state.filter);
  const [filterResultType, setFilterResultType] = useState('Select');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [currentFilterLocation, setCurrentFilterLocation] = useState();
  const [newFilterLocation, setNewFilterLocation] = useState();
  const dispatch = useDispatch();
  /**
   * all node-values that require string filters
   */
  const stringFilterTypes = useMemo(() => {
    if (nodes.length === 0) return [];
    const filterTypes = ['name', 'color'];
    Object.keys(nodes[0].data).forEach((dataPoint) => {
      if (typeof nodes[0].data[dataPoint] === 'string') filterTypes.push(dataPoint);
    });
    return filterTypes;
  }, [nodes]);
  /**
   * all node-values that require number filters
   */
  const numberFilterTypes = useMemo(() => {
    if (nodes.length === 0) return [];
    const filterTypes = ['size'];
    Object.keys(nodes[0].data).forEach((dataPoint) => {
      if (typeof nodes[0].data[dataPoint] === 'number') filterTypes.push(dataPoint);
    });
    return filterTypes;
  }, [nodes]);

  /**
   * updates the filter collection and adds the change to the action history
   * @param newFilterCollection - the new filter settings
   */
  const updateFilterCollection = (newFilterCollection) => {
    const filterChange = [{
      type: 'filterChange',
      before: filterCollection,
      after: newFilterCollection
    }];
    dispatch(addToActionHistory(filterChange));
    dispatch(setFilterCollection(newFilterCollection));
  };

  /**
   * find element in the filter collection by id
   * @param collection - the collection to search
   * @param id - the id of the element (filter or collection) to find
   * @returns the found element
   */
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

  /**
   * filter through the node collection
   * @param nodes - nodes to filter
   * @param filter - the filter to use
   * @returns {*[]} - the filtered nodes
   */
  // eslint-disable-next-line no-shadow
  const filterNodes = (nodes, filter) => {
    let resultNodes = [...nodes];
    if (filter.type === 'string') {
      resultNodes = resultNodes.filter((node) => {
        const filterDataLocation = filter.filterBy === 'name' || filter.filterBy === 'color' ? node : node.data;
        const nodeValue = filterDataLocation[filter.filterBy].toLowerCase();
        if (filter.selectFunction === 'contains') return nodeValue.includes(filter.value.toLowerCase());
        if (filter.selectFunction === 'doesn\'t contain') return !(nodeValue.includes(filter.value.toLowerCase()));
        if (filter.selectFunction === 'is not') return nodeValue !== filter.value.toLowerCase();
        return nodeValue === filter.value.toLowerCase();
      });
    } else {
      resultNodes = resultNodes.filter((node) => {
        const filterDataLocation = filter.filterBy === 'size' ? node : node.data;
        const nodeValue = filterDataLocation[filter.filterBy];
        if (filter.selectFunction === 'is not') return nodeValue > filter.max || nodeValue < filter.min;
        return nodeValue <= filter.max && nodeValue >= filter.min;
      });
    }
    return resultNodes;
  };

  /**
   * apply all created filters to the nodes
   * @param filterCollection - all the filters
   * @param resultType - should the filtered node be selected or should the nodes that don't match the filter be made invisible
   */
  // eslint-disable-next-line no-shadow
  const applyFilters = (filterCollection, resultType) => {
    nodes.forEach((node) => node.setVisibility(true));
    if (!filterCollection.elements.length) return;
    const applyCollectionFilter = (collection, availableNodes) => {
      let temporaryNodes = [];
      if (collection.operator === 'and') {
        temporaryNodes = [...availableNodes];
        collection.elements.forEach((collectionElement) => {
          if (collectionElement.type === 'collection'
            && collectionElement.elements.length) {
            temporaryNodes = applyCollectionFilter(collectionElement, temporaryNodes);
          } else {
            temporaryNodes = filterNodes(temporaryNodes, collectionElement);
          }
        });
      } else {
        collection.elements.forEach((collectionElement) => {
          if (collectionElement.type === 'collection') {
            temporaryNodes = [...temporaryNodes, ...applyCollectionFilter(collectionElement, availableNodes)];
          } else {
            temporaryNodes = [...temporaryNodes, ...filterNodes(availableNodes, collectionElement)];
          }
        });
        // remove duplicate nodes
        temporaryNodes = [...new Set(temporaryNodes)];
      }
      return temporaryNodes;
    };
    const filteredNodes = applyCollectionFilter(filterCollection, nodes);
    if (resultType === 'Select') {
      dispatch(setSelectedNodes(filteredNodes));
    } else {
      nodes.forEach((node) => {
        if (!filteredNodes.includes(node)) node.setVisibility(false);
      });
    }
    dispatch(setNodes(nodes));
  };

  /**
   * enabled the movement of filters to a different position or collection
   */
  const moveFilter = () => {
    if (currentFilterLocation && newFilterLocation && !(
      currentFilterLocation.position === newFilterLocation.position
      && currentFilterLocation.collectionId === newFilterLocation.collectionId
    )) {
      const newFilterCollection = JSON.parse(JSON.stringify(filterCollection));
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
      updateFilterCollection(newFilterCollection);
    }
    setNewFilterLocation(-1);
  };

  useEffect(() => {
    if (!filterCloneSettings && newFilterLocation !== -1) {
      moveFilter();
    }
  }, [filterCloneSettings, newFilterLocation]);

  useEffect(() => {
    if (autoRefresh) applyFilters(filterCollection, filterResultType);
  }, [autoRefresh, filterCollection, filterResultType]);

  /**
   * adds a filter to a collection
   * @param collectionId - the id of the collection to add the filter to
   */
  const addFilter = (collectionId) => {
    const newFilterCollection = JSON.parse(JSON.stringify(filterCollection));
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
    updateFilterCollection(newFilterCollection);
  };

  /**
   * updates a filter or collection element
   * @param id - the id of the element to update
   * @param newElement - info about the new settings
   */
  const updateCollectionElement = (id, newElement) => {
    const newFilterCollection = JSON.parse(JSON.stringify(filterCollection));
    const elementToUpdate = findCollectionElementById(newFilterCollection, id);
    Object.keys(newElement).forEach((attribute) => { elementToUpdate[attribute] = newElement[attribute]; });
    updateFilterCollection(newFilterCollection);
  };

  /**
   * removes a filter or collection element
   * @param collectionId - the collection id of the collection the element should be removed from
   * @param elementId - the id of the element that should be removed
   */
  const removeElementFromCollection = (collectionId, elementId) => {
    const newFilterCollection = JSON.parse(JSON.stringify(filterCollection));
    const collection = findCollectionElementById(newFilterCollection, collectionId);
    collection.elements = collection.elements.filter((element) => (element.id !== elementId));
    collection.elements.forEach((element, index) => collection.elements[index].position = index);
    updateFilterCollection(newFilterCollection);
  };

  /**
   * when a filter or collection is dragged, this sets the location the mouse is hovered above
   * @param locationSettings - info about the location
   */
  const updateNewFilterLocation = (locationSettings) => {
    if (filterCloneSettings) {
      setNewFilterLocation(locationSettings);
    }
  };

  /**
   * set the result type of the filter window
   * @param type - the result type
   */
  const updateFilterResultType = (type) => {
    if (filterResultType === 'Select' && type === 'Show') dispatch(setSelectedNodes([]));
    setFilterResultType(type);
  };

  /**
   * updates the auto refresh feature
   * @param enabled - the new state of the feature
   */
  const updateAutoRefresh = (enabled) => {
    setAutoRefresh(enabled);
    applyFilters(filterCollection, filterResultType);
  };

  return (
    <MenuElement headline="Filters" icon={filterIcon} className="filter-menu" rightSide>
      <div className="filters-container">
        <div className="filters-wrapper">
          <Collection
            collection={filterCollection}
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
    </MenuElement>
  );
};

export default Filters;
