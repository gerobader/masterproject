import React, {useState, useEffect} from 'react';
import Filter from './Controls/Filters/Filter/Filter';
import MenuElement from './MenuElement/MenuElement';
import Appearance from './Controls/Appearance/Appearance';
import Layout from './Controls/Layout/Layout';
import Collection from './Controls/Filters/Collection/Collection';
import Filters from './Controls/Filters/Filters';
import Footer from './Footer/Footer';
import SaveNetworkModal from './Modals/SaveNetworkModal/SaveNetworkModal';
import LoadNetworkModal from './Modals/LoadNetworkModal/LoadNetworkModal';
import ControlsModal from './Modals/ControlsModal/ControlsModal';

import './Overlay.scss';
import appearanceIcon from '../../assets/appearance-icon.svg';
import layoutIcon from '../../assets/layout-icon.svg';
import filterIcon from '../../assets/filter-icon.svg';

const Overlay = () => {
  const [filterCloneSettings, setFilterCloneSettings] = useState();
  const [filterClonePosition, setFilterClonePosition] = useState({x: 0, y: 0});

  useEffect(() => {
    const mouseMove = (e) => {
      if (filterCloneSettings) {
        setFilterClonePosition({x: e.clientX, y: e.clientY});
      }
    };
    const mouseUp = () => {
      setFilterCloneSettings(undefined);
    };
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);
    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
    };
  }, [filterCloneSettings, setFilterCloneSettings, setFilterClonePosition]);

  return (
    <div id="user-interface">
      {filterCloneSettings && (
        <div id="filter-clone-wrapper" style={{left: `${filterClonePosition.x - 10}px`, top: `${filterClonePosition.y - 10}px`}}>
          {filterCloneSettings.type === 'collection'
            ? <Collection collection={filterCloneSettings}/>
            : <Filter filter={filterCloneSettings}/>}
        </div>
      )}
      <SaveNetworkModal/>
      <LoadNetworkModal/>
      <ControlsModal/>
      <div className="left-menu">
        <MenuElement headline="Appearance" icon={appearanceIcon}>
          <Appearance/>
        </MenuElement>
        <MenuElement headline="Layout" icon={layoutIcon}>
          <Layout/>
        </MenuElement>
      </div>
      <div className="right-menu">
        <MenuElement headline="Filters" icon={filterIcon} rightSide className="filter-menu">
          <Filters
            setFilterCloneSettings={setFilterCloneSettings}
            filterCloneSettings={filterCloneSettings}
            setFilterClonePosition={setFilterClonePosition}
          />
        </MenuElement>
      </div>
      <Footer/>
    </div>
  );
};

export default Overlay;
