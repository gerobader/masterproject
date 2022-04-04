import React, {useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import Select from '../../UI/Select/Select';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Button from '../../UI/Button/Button';

import './Filters.scss';
import StringFilter from './StringFilter/StringFilter';
import NumberFilter from './NumberFilter/NumberFilter';

const Filters = () => {
  const {nodes} = useSelector((state) => state.networkElements);
  const [filterResultType, setFilterResultType] = useState('Select');
  const [hotRefresh, setHotRefresh] = useState(false);
  const [filterType, setFilterType] = useState();
  const [filters, setFilters] = useState([]);
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

  const addFilter = () => {
    if (!filterType) return;
    const filter = {};
    if (typeof nodes[0].data[filterType] === 'string') {
      filter.type = 'string';
      filter.datapoint = 'type';
      filter.selectFunction = 'contains';
      filter.value = '';
    }
    const newFilters = [...filters, filter];
    setFilters(newFilters);
  };

  const updateFilter = (index, newFilter) => {
    console.log(index, newFilter);
  };

  const applyFilters = () => {

  };

  return (
    <div className="filters-wrapper">
      {filters.map((filter, index) => (filter.type === 'string' ? (
        <StringFilter
          key={index}
          id={index}
          filter={filter}
          updateFilter={updateFilter}
          dataPoints={stringDataPoints}
        />
      ) : (
        <NumberFilter/>
      )))}
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
        <Button text="Apply" onClick={applyFilters}/>
      </div>
    </div>
  );
};

export default Filters;
