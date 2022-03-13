import React, {useState} from 'react';
import Select from '../Select/Select';
import Button from '../Button/Button';
import Setting from '../Setting/Setting';

import './ExpandableSetting.scss';

const ExpandableSetting = ({
  name, mappingValue, setMappingValue, children, mappingOptions
}) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`expandable-setting${expanded ? ' open' : ''}`}>
      <div className="expandable-label" onClick={() => setExpanded(!expanded)}>
        {name}
        <div className="arrow"/>
      </div>
      <div className="setting-wrapper">
        <Setting name="Mapping Value">
          <Select
            options={mappingOptions}
            value={mappingValue}
            setSelected={setMappingValue}
            parentOpenState={expanded}
            className="overflow-fix"
          />
          {mappingValue && (<Button text="reset" className="reset" onClick={() => setMappingValue(undefined)}/>)}
        </Setting>
        {typeof children === 'function' ? children(expanded) : children}
      </div>
    </div>
  );
};

export default ExpandableSetting;
