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
  const [currentFilterIndex, setCurrentFilterIndex] = useState();
  const [newFilterIndex, setNewFilterIndex] = useState();
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
    if (currentFilterIndex !== newFilterIndex) {
      let newFilters;
      if (currentFilterIndex < newFilterIndex) {
        newFilters = arrayMove(filters, currentFilterIndex, newFilterIndex - 1);
      } else {
        newFilters = arrayMove(filters, currentFilterIndex, newFilterIndex);
      }
      newFilters.forEach((filter, index) => newFilters[index].position = index);
      if (hotRefresh) applyFilters(newFilters, filterResultType);
      setFilters(newFilters);
    }
    setNewFilterIndex(-1);
  };

  useEffect(() => {
    if (!filterCloneSettings && newFilterIndex !== -1) {
      moveFilter();
    }
  }, [filterCloneSettings, newFilterIndex]);

  const addFilter = () => {
    if (!filterType) return;
    const filter = {};
    filter.filterBy = filterType;
    filter.id = uuidv4();
    filter.position = filters.length;
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
    const newFilters = [...filters, filter];
    if (hotRefresh) applyFilters(newFilters, filterResultType);
    setFilters(newFilters);
  };

  const updateFilter = (newFilter) => {
    const newFilters = filters.map((filter) => (filter.id === newFilter.id ? newFilter : filter));
    if (hotRefresh) applyFilters(newFilters, filterResultType);
    setFilters(newFilters);
  };

  const removeFilter = (id) => {
    const newFilters = filters.filter((filter) => (filter.id !== id));
    newFilters.forEach((filter, index) => newFilters[index].position = index);
    applyFilters(newFilters, filterResultType);
    setFilters(newFilters);
  };

  const updateNewFilterIndex = (index) => {
    if (filterCloneSettings) {
      setNewFilterIndex(index);
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

  return (
    <div className="filters-container">
      <div className="filters-wrapper">
        <div
          className={`hover-indicator-wrapper${filterCloneSettings ? ' active' : ''}`}
          onMouseEnter={() => updateNewFilterIndex(0)}
          onMouseLeave={() => updateNewFilterIndex(-1)}
        >
          <div className="indicator"/>
        </div>
        {filters.map((filter, index) => (
          <div key={filter.id}>
            <Filter
              filter={filter}
              updateFilter={updateFilter}
              removeFilter={removeFilter}
              stringFilterTypes={stringFilterTypes}
              numberFilterTypes={numberFilterTypes}
              filterCloneSettings={filterCloneSettings}
              setFilterCloneSettings={setFilterCloneSettings}
              setFilterClonePosition={setFilterClonePosition}
              setCurrentFilterIndex={setCurrentFilterIndex}
            />
            <div
              className={`hover-indicator-wrapper${filterCloneSettings ? ' active' : ''}`}
              onMouseEnter={() => updateNewFilterIndex(index + 1)}
              onMouseLeave={() => updateNewFilterIndex(-1)}
            >
              <div className="indicator"/>
            </div>
          </div>
        ))}
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
