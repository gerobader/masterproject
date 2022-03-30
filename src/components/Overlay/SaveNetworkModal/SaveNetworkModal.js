import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import MenuElement from '../MenuElement/MenuElement';
import TextInput from '../UI/TextInput/TextInput';
import Checkbox from '../UI/Checkbox/Checkbox';
import Button from '../UI/Button/Button';
import {setShowSaveNetworkModal} from '../../../redux/settings/settings.actions';

import './SaveNetworkModal.scss';

const SaveNetworkModal = () => {
  const {nodes, edges} = useSelector((state) => state.networkElements);
  const {showSaveNetworkModal} = useSelector((state) => state.settings);
  const [networkName, setNetworkName] = useState('');
  const [savePathMap, setSavePathMap] = useState(false);
  const dispatch = useDispatch();

  const saveNetwork = () => {
    if (networkName) {
      const serializedNodes = nodes.map((node) => node.serialize(savePathMap));
      const serializedEdges = edges.map((edge) => edge.serialize());
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      const json = JSON.stringify({nodes: serializedNodes, edges: serializedEdges});
      const blob = new Blob([json], {type: 'octet/stream'});
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `${networkName}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      dispatch(setShowSaveNetworkModal(false));
    }
  };

  return (
    <div className={`save-network-modal${showSaveNetworkModal ? ' show' : ''}`}>
      <div className="background-overlay"/>
      <MenuElement headline="Save Network" simpleHeader>
        <div className="close-button" onClick={() => dispatch(setShowSaveNetworkModal(false))}/>
        <TextInput value={networkName} setValue={setNetworkName} placeholder="Filename"/>
        <Checkbox
          text="Save Path Map (increases File size)"
          checked={savePathMap}
          setChecked={setSavePathMap}
          name="path-map-setting"
        />
        <div className="button-wrapper">
          <Button text="Save Network" onClick={saveNetwork} disabled={networkName === ''}/>
        </div>
      </MenuElement>
    </div>
  );
};

export default SaveNetworkModal;
