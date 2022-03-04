import React, {useEffect, useState} from 'react';
import * as neo4j from 'neo4j-driver';
import Renderer from '../components/Renderer/Renderer';
import Overlay from '../components/Overlay/Overlay';

import './NetworkVisualizer.scss';

const NetworkVisualizer = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  useEffect(async () => {
    const neoDriver = neo4j.driver(
      'bolt://demo.neo4jlabs.com',
      neo4j.auth.basic('gameofthrones', 'gameofthrones'),
      {encrypted: true}
    );
    const session = await neoDriver.session({database: 'gameofthrones'});
    const res = await session.run('MATCH (n)-[:INTERACTS1]->(m) RETURN n.name as source, m.name as target');
    await session.close();
    const uniqueNodes = new Set();
    const e = res.records.map((r) => {
      const source = r.get('source');
      const target = r.get('target');
      uniqueNodes.add(source);
      uniqueNodes.add(target);
      return {source, target};
    });
    const n = Array.from(uniqueNodes).map((node) => ({label: node}));
    setNodes(n);
    setEdges(e);
  }, []);
  return (
    <div>
      {(nodes.length && edges.length) && <Renderer remoteNodes={nodes} remoteEdges={edges}/>}
      <Overlay/>
    </div>
  );
};

export default NetworkVisualizer;
