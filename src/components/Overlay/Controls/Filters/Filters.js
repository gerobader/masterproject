import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Select from '../../UI/Select/Select';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Button from '../../UI/Button/Button';
import Filter from './Filter/Filter';
import {setSelectedNodes} from '../../../../redux/networkElements/networkElements.actions';

import './Filters.scss';

const Filters = () => {
  const {nodes} = useSelector((state) => state.networkElements);
  const [filterResultType, setFilterResultType] = useState('Select');
  const [hotRefresh, setHotRefresh] = useState(false);
  const [filterType, setFilterType] = useState();
  const [filters, setFilters] = useState([]);
  const dispatch = useDispatch();

  // eslint-disable-next-line no-shadow
  const applyFilters = (filters) => {
    let finalNodes = [...nodes];
    filters.forEach((filter) => {
      if (filter.type === 'string') {
        finalNodes = finalNodes.filter((node) => {
          const nodeDataPoint = node.data[filter.dataPoint];
          if (filter.selectFunction === 'contains') return nodeDataPoint.includes(filter.value);
          if (filter.selectFunction === 'doesn\'t contain') return !(nodeDataPoint.includes(filter.value));
          if (filter.selectFunction === 'is not') return nodeDataPoint !== filter.value;
          return nodeDataPoint === filter.value;
        });
      } else {
        finalNodes = finalNodes.filter((node) => {
          const nodeDataPoint = node.data[filter.dataPoint];
          if (filter.selectFunction === 'is not') return nodeDataPoint > filter.max || nodeDataPoint < filter.min;
          return nodeDataPoint <= filter.max && nodeDataPoint >= filter.min;
        });
      }
    });
    dispatch(setSelectedNodes(finalNodes));
  };

  const addFilter = () => {
    if (!filterType) return;
    const filter = {};
    filter.dataPoint = filterType;
    if (typeof nodes[0].data[filterType] === 'string') {
      filter.type = 'string';
      filter.selectFunction = 'contains';
      filter.value = '';
    } else {
      const dataRange = nodes.map((node) => node.data[filterType]);
      filter.type = 'number';
      filter.selectFunction = 'is';
      filter.min = Math.min(...dataRange);
      filter.max = Math.max(...dataRange);
    }
    const newFilters = [...filters, filter];
    if (hotRefresh) applyFilters(newFilters);
    setFilters(newFilters);
  };

  const updateFilter = (index, newFilter) => {
    const newFilters = filters.map((filter, i) => (i === index ? newFilter : filter));
    if (hotRefresh) applyFilters(newFilters);
    setFilters(newFilters);
  };

  const removeFilter = (index) => {
    const newFilters = filters.filter((filter, i) => (i !== index));
    if (hotRefresh) applyFilters(newFilters);
    setFilters(newFilters);
  };

  return (
    <div className="filters-container">
      <div className="filters-wrapper">
        {filters.map((filter, index) => (
          <Filter
            key={index}
            id={index}
            filter={filter}
            updateFilter={updateFilter}
            removeFilter={removeFilter}
          />
        ))}
        <div className="add-filter-wrapper">
          <div className="add-button" onClick={addFilter}/>
          <Select
            options={nodes.length ? Object.keys(nodes[0].data) : []}
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
          setSelected={setFilterResultType}
          opensUp
          alwaysShowArrow
        />
        <Checkbox
          name="hot-refresh"
          text="Hot refresh"
          checked={hotRefresh}
          setChecked={setHotRefresh}
        />
        <Button text="Apply" onClick={() => applyFilters(filters)}/>
      </div>
    </div>
  );
};

export default Filters;
