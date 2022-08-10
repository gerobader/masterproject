import React, {useState, useEffect} from 'react';
import Filter from './Controls/Filters/Filter/Filter';
import Appearance from './Controls/Appearance/Appearance';
import Layout from './Controls/Layout/Layout';
import Collection from './Controls/Filters/Collection/Collection';
import Filters from './Controls/Filters/Filters';
import Footer from './Footer/Footer';
import SaveNetworkModal from './Modals/SaveNetworkModal/SaveNetworkModal';
import LoadNetworkModal from './Modals/LoadNetworkModal/LoadNetworkModal';
import ControlsModal from './Modals/ControlsModal/ControlsModal';
import ErrorModal from './Modals/ErrorModal/ErrorModal';

import './Overlay.scss';

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
      <ErrorModal/>
      <div className="left-menu">
        <Appearance/>
        <Layout/>
      </div>
      <div className="right-menu">
        <Filters
          setFilterCloneSettings={setFilterCloneSettings}
          filterCloneSettings={filterCloneSettings}
          setFilterClonePosition={setFilterClonePosition}
        />
      </div>
      <Footer/>
    </div>
  );
};

export default Overlay;
