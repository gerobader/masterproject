import React from 'react';
import MenuElement from './MenuElement/MenuElement';
import Appearance from './Controls/Appearance/Appearance';
import Footer from './Footer/Footer';

import './Overlay.scss';

const Overlay = () => (
  <div id="user-interface">
    <MenuElement headline="Appearance">
      <Appearance/>
    </MenuElement>
    <Footer/>
  </div>
);

export default Overlay;
