import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Modal from '../Modal';
import TextInput from '../../UI/TextInput/TextInput';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Button from '../../UI/Button/Button';
import {setNetworkName} from '../../../../redux/network/network.actions';
import {setShowSaveNetworkModal} from '../../../../redux/settings/settings.actions';

import './SaveNetworkModal.scss';

const SaveNetworkModal = () => {
  const {
    name, diameter, radius, averageGeodesicDistance, averageDegree, reciprocity, density,
    directed, nodes, edges
  } = useSelector((state) => state.network);
  const {
    showSaveNetworkModal, showLabel, networkBoundarySize, showAxes, axes
  } = useSelector((state) => state.settings);
  const [savePathMap, setSavePathMap] = useState(false);
  const dispatch = useDispatch();

  /**
   * save the network to a json file
   */
  const saveNetwork = () => {
    if (name) {
      const serializedNodes = nodes.map((node) => node.serialize(savePathMap));
      const serializedEdges = edges.map((edge) => edge.serialize());
      const axesInfo = {
        showAxes,
        xAxis: {
          text: axes.xAxisLabel.text,
          divisions: axes.xAxisDivisions.map((label) => ({
            text: label.text,
            position: {x: label.position.x, y: label.position.y, z: label.position.z}
          }))
        },
        yAxis: {
          text: axes.yAxisLabel.text,
          divisions: axes.yAxisDivisions.map((label) => ({
            text: label.text,
            position: {x: label.position.x, y: label.position.y, z: label.position.z}
          }))
        },
        zAxis: {
          text: axes.zAxisLabel.text,
          divisions: axes.zAxisDivisions.map((label) => ({
            text: label.text,
            position: {x: label.position.x, y: label.position.y, z: label.position.z}
          }))
        }
      };
      const data = new Blob([JSON.stringify({
        name,
        showLabel,
        networkBoundarySize,
        axesInfo,
        diameter,
        radius,
        averageGeodesicDistance,
        averageDegree,
        reciprocity,
        density,
        directed,
        nodes: serializedNodes,
        edges: serializedEdges
      })], {type: 'octet/stream'});
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      const url = window.URL.createObjectURL(data);
      a.href = url;
      a.download = `${name}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      dispatch(setShowSaveNetworkModal(false));
    }
  };

  return (
    <Modal
      className="save-network"
      show={showSaveNetworkModal}
      headline="Save Network"
      closeFunction={() => dispatch(setShowSaveNetworkModal(false))}
    >
      <TextInput value={name} setValue={(value) => dispatch(setNetworkName(value))} placeholder="Filename"/>
      <Checkbox
        text="Save Path Map (increases File size)"
        checked={savePathMap}
        setChecked={setSavePathMap}
        name="path-map-setting"
      />
      <div className="button-wrapper">
        <Button text="Save Network" onClick={saveNetwork} disabled={name === ''}/>
      </div>
    </Modal>
  );
};

export default SaveNetworkModal;
