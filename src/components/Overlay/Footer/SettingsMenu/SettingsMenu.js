import React, {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import * as THREE from 'three';
import MenuSetting from './MenuSetting/MenuSetting';
import Checkbox from '../../UI/Checkbox/Checkbox';
import {
  setOrbitPreview,
  setShowSaveNetworkModal,
  setShowLoadNetworkModal,
  setShowControlsModal,
  undoAction,
  redoAction
} from '../../../../redux/settings/settings.actions';
import {calculateAveragePosition} from '../../../utility';

import './SettingsMenu.scss';
import undoIcon from '../../../../assets/undo-icon.svg';
import redoIcon from '../../../../assets/redo-icon.svg';
import downloadIcon from '../../../../assets/download-icon.svg';
import uploadIcon from '../../../../assets/upload-icon.svg';

const SettingsMenu = ({hideSettings}) => {
  const {orbitPreview, cameraControls} = useSelector((state) => state.settings);
  const {nodes} = useSelector((state) => state.network);
  const menuRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    const clickFunction = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        hideSettings();
      }
    };
    window.addEventListener('click', clickFunction);
    return () => {
      window.removeEventListener('click', clickFunction);
    };
  }, [menuRef]);

  const centerView = () => {
    cameraControls.target = nodes ? calculateAveragePosition(nodes) : new THREE.Vector3();
  };

  return (
    <div className="settings-menu" ref={menuRef}>
      <MenuSetting menuText="Undo" onClick={() => dispatch(undoAction())}>
        <img alt="undo-icon" src={undoIcon}/>
      </MenuSetting>
      <MenuSetting menuText="Redo" onClick={() => dispatch(redoAction())}>
        <img alt="redo-icon" src={redoIcon}/>
      </MenuSetting>
      <hr/>
      <MenuSetting menuText="Save Network" onClick={() => dispatch(setShowSaveNetworkModal(true))}>
        <img alt="save network icon" src={downloadIcon}/>
      </MenuSetting>
      <MenuSetting menuText="Load Network" onClick={() => dispatch(setShowLoadNetworkModal(true))}>
        <img alt="load network icon" src={uploadIcon}/>
      </MenuSetting>
      <hr/>
      <MenuSetting menuText="Rotate Network" onClick={() => dispatch(setOrbitPreview(!orbitPreview))}>
        <Checkbox name="rotation-active" checked={orbitPreview} small/>
      </MenuSetting>
      <MenuSetting menuText="Center View" onClick={centerView}/>
      <MenuSetting menuText="Show Controls" onClick={() => dispatch(setShowControlsModal(true))}/>
    </div>
  );
};

export default SettingsMenu;
