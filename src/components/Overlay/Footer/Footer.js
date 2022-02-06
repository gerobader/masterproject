import React from 'react';
import {useSelector} from 'react-redux';

import './Footer.scss';

const Footer = () => {
  const {
    nodes, edges, selectedNodes, selectedEdges
  } = useSelector((state) => state.networkElements);
  console.log(nodes, edges);
  return (
    <div className="footer">
      <p>{`Nodes: ${nodes.length}${selectedNodes.length ? ` (${selectedNodes.length})` : ''}`}</p>
      <p>{`Edges: ${edges.length}${selectedEdges.length ? ` (${selectedEdges.length})` : ''}`}</p>
    </div>
  );
};

export default Footer;
