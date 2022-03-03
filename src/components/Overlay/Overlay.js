import React from 'react';
import MenuElement from './MenuElement/MenuElement';
import Appearance from './Controls/Appearance/Appearance';
import Layout from './Controls/Layout/Layout';
import Footer from './Footer/Footer';

import './Overlay.scss';

const Overlay = () => (
  <div id="user-interface">
    <div className="left-menu">
      <MenuElement headline="Appearance">
        <Appearance/>
      </MenuElement>
      <MenuElement headline="Layout">
        <Layout/>
      </MenuElement>
    </div>
    <Footer/>
  </div>
);

export default Overlay;
