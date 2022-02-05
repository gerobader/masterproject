import React from 'react';
import MenuElement from './MenuElement/MenuElement';
import Appearance from './Controls/Appearance/Appearance';

import './Overlay.scss';

const Overlay = () => {
  return (
    <div id="ui-interface">
      <MenuElement headline="Appearance">
        <Appearance/>
      </MenuElement>
    </div>
  );
};

export default Overlay;
