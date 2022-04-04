import React from 'react';
import MenuElement from './MenuElement/MenuElement';
import Appearance from './Controls/Appearance/Appearance';
import Layout from './Controls/Layout/Layout';
import Filters from './Controls/Filters/Filters';
import Footer from './Footer/Footer';
import SaveNetworkModal from './SaveNetworkModal/SaveNetworkModal';

import './Overlay.scss';
import appearanceIcon from '../../assets/appearance-icon.svg';
import layoutIcon from '../../assets/layout-icon.svg';
import filterIcon from '../../assets/filter-icon.svg';

const Overlay = () => (
  <div id="user-interface">
    <SaveNetworkModal/>
    <div className="left-menu">
      <MenuElement headline="Appearance" icon={appearanceIcon}>
        <Appearance/>
      </MenuElement>
      <MenuElement headline="Layout" icon={layoutIcon}>
        <Layout/>
      </MenuElement>
    </div>
    <div className="right-menu">
      <MenuElement headline="Filters" icon={filterIcon} rightSide>
        <Filters/>
      </MenuElement>
    </div>
    <Footer/>
  </div>
);

export default Overlay;
