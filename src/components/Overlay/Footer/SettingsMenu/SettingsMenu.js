import React, {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import MenuSetting from './MenuSetting/MenuSetting';
import {setOrbitPreview} from '../../../../redux/settings/settings.actions';

import './SettingsMenu.scss';
import undoIcon from '../../../../assets/undo-icon.svg';
import redoIcon from '../../../../assets/redo-icon.svg';
import downloadIcon from '../../../../assets/download-icon.svg';
import uploadIcon from '../../../../assets/upload-icon.svg';

const SettingsMenu = ({hideSettings}) => {
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

  return (
    <div className="settings-menu" ref={menuRef}>
      <MenuSetting menuText="Undo" imgSource={undoIcon}/>
      <MenuSetting menuText="Redo" imgSource={redoIcon}/>
      <hr/>
      <MenuSetting menuText="Save Network" imgSource={downloadIcon}/>
      <MenuSetting menuText="Load Network" imgSource={uploadIcon}/>
      <hr/>
      <MenuSetting menuText="Rotate Network" onClick={() => dispatch(setOrbitPreview(true))}/>
      <MenuSetting menuText="Use First Person Controls"/>
    </div>
  );
};

export default SettingsMenu;
