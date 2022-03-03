import React from 'react';
import MenuElement from './MenuElement/MenuElement';
import Appearance from './Controls/Appearance/Appearance';
import Layout from './Controls/Layout/Layout';
import Footer from './Footer/Footer';

import './Overlay.scss';
import appearanceIcon from '../../assets/appearance-icon.svg';
import layoutIcon from '../../assets/layout-icon.svg';

const Overlay = () => (
  <div id="user-interface">
    <div className="left-menu">
      <MenuElement headline="Appearance" icon={appearanceIcon}>
        <Appearance/>
      </MenuElement>
      <MenuElement headline="Layout" icon={layoutIcon}>
        <Layout/>
      </MenuElement>
    </div>
    <Footer/>
  </div>
);

export default Overlay;
