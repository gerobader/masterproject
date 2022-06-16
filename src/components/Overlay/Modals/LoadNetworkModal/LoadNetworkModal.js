import React, {useState, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Modal from '../Modal';
import FileUpload from "../../UI/FileUpload/FileUpload";
import Checkbox from '../../UI/Checkbox/Checkbox';
import Button from '../../UI/Button/Button';
import {
  setNetworkName, setNetworkStatistics,
  setNodesAndEdges,
  setSelectedEdges,
  setSelectedNodes
} from '../../../../redux/network/network.actions';
import {
  resetActionHistory,
  setNetworkBoundarySize,
  setPerformanceMode,
  setShowLabel,
  setShowLoadNetworkModal
} from '../../../../redux/settings/settings.actions';

import './LoadNetworkModal.scss';

const LoadNetworkModal = () => {
  const {nodes} = useSelector((state) => state.network);
  const {showLoadNetworkModal} = useSelector((state) => state.settings);
  const [networkData, setNetworkData] = useState();
  const [usePerformanceMode, setUsePerformanceMode] = useState(false);
  const dispatch = useDispatch();

  const loadNetwork = () => {
    nodes.forEach((node) => node.label.removeFromDom());
    dispatch(setSelectedNodes([]));
    dispatch(setSelectedEdges([]));
    dispatch(setPerformanceMode(usePerformanceMode));
    if (networkData.name) dispatch(setNetworkName(networkData.name));
    if (networkData.showLabel) dispatch(setShowLabel(networkData.showLabel));
    if (networkData.networkBoundarySize) dispatch(setNetworkBoundarySize(networkData.networkBoundarySize));
    dispatch(setNodesAndEdges(networkData.nodes, networkData.edges, true));
    dispatch(setNetworkStatistics(
      networkData?.diameter, networkData?.radius, networkData?.averageGeodesicDistance, networkData?.averageDegree,
      networkData?.reciprocity, networkData?.density
    ));
    dispatch(resetActionHistory());
    dispatch(setShowLoadNetworkModal(false));
  };

  return (
    <Modal
      className="load-network"
      show={showLoadNetworkModal}
      headline="Load Network"
      closeFunction={() => dispatch(setShowLoadNetworkModal(false))}
    >
      <FileUpload id="network-upload" labelText="Choose File" onFileLoaded={setNetworkData} networkData={networkData}/>
      <Checkbox
        text="Use Performance Mode"
        checked={usePerformanceMode}
        setChecked={setUsePerformanceMode}
        name="use-performance-mode"
      />
      <div className="button-wrapper">
        <Button text="Load Network" onClick={loadNetwork} disabled={!networkData}/>
      </div>
    </Modal>
  );
};

export default LoadNetworkModal;
