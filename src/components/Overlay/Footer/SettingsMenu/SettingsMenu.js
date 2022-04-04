import React, {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import * as THREE from 'three';
import MenuSetting from './MenuSetting/MenuSetting';
import {setOrbitPreview, setShowSaveNetworkModal} from '../../../../redux/settings/settings.actions';
import {
  setSelectedEdges, setSelectedNodes, setNodesAndEdges
} from '../../../../redux/networkElements/networkElements.actions';
import {calculateAveragePosition} from '../../../utility';

import './SettingsMenu.scss';
import undoIcon from '../../../../assets/undo-icon.svg';
import redoIcon from '../../../../assets/redo-icon.svg';
import downloadIcon from '../../../../assets/download-icon.svg';
import uploadIcon from '../../../../assets/upload-icon.svg';

const SettingsMenu = ({hideSettings, undoAction, redoAction}) => {
  const {orbitPreview, camera} = useSelector((state) => state.settings);
  const {nodes} = useSelector((state) => state.networkElements);
  const menuRef = useRef();
  const fileInput = useRef();
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

  const loadNetwork = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const networkData = JSON.parse(fileReader.result);
      dispatch(setSelectedNodes([]));
      dispatch(setSelectedEdges([]));
      dispatch(setNodesAndEdges(networkData.nodes, networkData.edges, true));
    };
    fileReader.readAsText(e.target.files[0]);
  };

  const centerView = () => {
    const networkCenter = nodes ? calculateAveragePosition(nodes) : new THREE.Vector3();
    camera.lookAt(networkCenter);
  };

  return (
    <div className="settings-menu" ref={menuRef}>
      <input type="file" ref={fileInput} onChange={loadNetwork} className="file-upload"/>
      <MenuSetting menuText="Undo" imgSource={undoIcon} onClick={undoAction}/>
      <MenuSetting menuText="Redo" imgSource={redoIcon} onClick={redoAction}/>
      <hr/>
      <MenuSetting menuText="Save Network" imgSource={downloadIcon} onClick={() => dispatch(setShowSaveNetworkModal(true))}/>
      <MenuSetting menuText="Load Network" imgSource={uploadIcon} onClick={() => fileInput.current.click()}/>
      <hr/>
      <MenuSetting menuText="Rotate Network" onClick={() => dispatch(setOrbitPreview(!orbitPreview))}/>
      <MenuSetting menuText="Center View" onClick={centerView}/>
      <MenuSetting menuText="Show Keyboard Controls"/>
    </div>
  );
};

export default SettingsMenu;
