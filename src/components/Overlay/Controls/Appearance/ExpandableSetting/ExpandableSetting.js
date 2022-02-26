import React, {useState} from 'react';

import './ExpandableSetting.scss';

const ExpandableSetting = ({name, children}) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`expandable-setting${expanded ? ' open' : ''}`}>
      <div className="expandable-label" onClick={() => setExpanded(!expanded)}>
        {name}
        <div className="arrow"/>
      </div>
      <div className="setting-wrapper">
        {children(expanded)}
      </div>
    </div>
  );
};

export default ExpandableSetting;
