import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import InfoTable from './InfoTable/InfoTable';
import ProgressBar from './ProgressBar/ProgressBar';

import './Footer.scss';

const Footer = () => {
  const {
    nodes, edges, selectedNodes, selectedEdges
  } = useSelector((state) => state.networkElements);
  const [progressInfo, setProgressInfo] = useState();
  return (
    <div className="footer-wrapper">
      {nodes.length && <InfoTable setProgressInfo={setProgressInfo}/>}
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
      </div>
    </div>
  );
};

export default Footer;
