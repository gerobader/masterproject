import React, {useState} from 'react';
import Select from '../../../UI/Select/Select';
import Button from '../../../UI/Button/Button';
import Setting from '../Setting/Setting';

import './ExpandableSetting.scss';

const ExpandableSetting = ({
  name, mappingValue, setMappingValue, children
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
            options={['Edge Count']}
            value={mappingValue}
            setSelected={setMappingValue}
            parentOpenState={expanded}
          />
          {mappingValue && (<Button text="reset" className="reset" onClick={() => setMappingValue(undefined)}/>)}
        </Setting>
        <Setting name="Range">
          {children}
        </Setting>
      </div>
    </div>
  );
};

export default ExpandableSetting;
