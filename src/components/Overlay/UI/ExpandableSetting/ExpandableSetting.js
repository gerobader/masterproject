import React, {useState} from 'react';
import Select from '../Select/Select';
import Button from '../Button/Button';
import Setting from '../Setting/Setting';

import './ExpandableSetting.scss';

const ExpandableSetting = ({
  name, mappingValue, setMappingValue, children, mappingType, setMappingType, dataPoints
}) => {
  const [expanded, setExpanded] = useState(false);
  const useMappingTypeInput = dataPoints && dataPoints[mappingValue] && typeof dataPoints[mappingValue][0] !== 'string';

  /**
   * checks if the newly selected mapping value is compatible with the selected mapping type and if not,
   * sets the mapping type to a compatible value
   * @param value
   */
  const checkNewMappingValue = (value) => {
    const compatibleWithRelativeInput = dataPoints && dataPoints[value] && typeof dataPoints[value][0] !== 'string';
    if (!compatibleWithRelativeInput && setMappingType) setMappingType('absolute');
    setMappingValue(value);
  };

  return (
    <div className={`expandable-setting${expanded ? ' open' : ''}`}>
      <div className="expandable-label" onClick={() => setExpanded(!expanded)}>
        {name}
        <div className="arrow"/>
      </div>
      <div className="setting-wrapper">
        <Setting name="Mapping Value">
          <Select
            options={Object.keys(dataPoints)}
            value={mappingValue}
            setSelected={checkNewMappingValue}
            parentOpenState={expanded}
            className="overflow-fix"
            defaultOption="- Select -"
            titleCaseOptions
          />
          {mappingValue && (<Button text="reset" className="reset" onClick={() => setMappingValue(undefined)}/>)}
        </Setting>
        {(setMappingType && useMappingTypeInput) && (
          <Setting name="Mapping Type">
            <Select
              options={['absolute', 'relative']}
              value={mappingType}
              setSelected={setMappingType}
              parentOpenState={expanded}
              className="overflow-fix"
              defaultOption="- Select -"
              titleCaseOptions
            />
            {mappingType && (<Button text="reset" className="reset" onClick={() => setMappingType(undefined)}/>)}
          </Setting>
        )}
        {typeof children === 'function' ? children(expanded) : children}
      </div>
    </div>
  );
};

export default ExpandableSetting;
