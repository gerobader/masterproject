import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import InfoTable from './InfoTable/InfoTable';
import ProgressBar from './ProgressBar/ProgressBar';
import SettingsMenu from './SettingsMenu/SettingsMenu';

import './Footer.scss';

const Footer = () => {
  const {
    nodes, edges, selectedNodes, selectedEdges
  } = useSelector((state) => state.networkElements);
  const [progressInfo, setProgressInfo] = useState();
  const [showInfoTable, setShowInfoTable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  return (
    <div className="footer-wrapper">
      {showInfoTable && <InfoTable setProgressInfo={setProgressInfo}/>}
      {showSettings && <SettingsMenu hideSettings={() => setShowSettings(false)}/>}
      <div className="footer">
        {/* eslint-disable-next-line max-len */}
        <div className="left-info">
          <p className="margin-right">
            {`Nodes: ${nodes.length}${selectedNodes.length ? ` (${selectedNodes.length})` : ''}
            ${selectedNodes.length === 1 ? ` (${selectedNodes[0].labelText})` : ''}`}
          </p>
          <p className="margin-right">
            {`Edges: ${edges.length}${selectedEdges.length ? ` (${selectedEdges.length})` : ''}`}
          </p>
          <ProgressBar progressInfo={progressInfo}/>
        </div>
        <div className="right-button-wrapper">
          <div
            className={`footer-button table${showInfoTable ? ' active' : ''}`}
            onClick={() => setShowInfoTable(!showInfoTable)}
          />
          <div
            className={`footer-button settings${showSettings ? ' active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;
