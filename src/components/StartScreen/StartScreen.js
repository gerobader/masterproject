import React, {useState} from 'react';
import * as neo4j from 'neo4j-driver';
import MenuElement from '../Overlay/MenuElement/MenuElement';
import Select from '../Overlay/UI/Select/Select';
import Button from '../Overlay/UI/Button/Button';
import Loader from '../Overlay/UI/Loader/Loader';
import Checkbox from '../Overlay/UI/Checkbox/Checkbox';

import './StartScreen.scss';

const networks = ['gameofthrones', 'movies'];

const StartScreen = ({use2Dimensions, setUse2Dimensions, setElements}) => {
  const [selectedNetwork, setSelectedNetwork] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const getNetworkData = async () => {
    if (selectedNetwork && !isLoading) {
      setIsLoading(true);
      const neoDriver = neo4j.driver(
        'bolt://demo.neo4jlabs.com',
        neo4j.auth.basic(selectedNetwork, selectedNetwork),
        {encrypted: true}
      );
      const session = await neoDriver.session({database: selectedNetwork});
      let res;
      const nodes = [];
      let edges = [];
      if (selectedNetwork === 'gameofthrones') {
        res = await session.run('MATCH (n)-[:INTERACTS1]->(m) RETURN n.name as source, m.name as target');
        await session.close();
        edges = res.records.map((r) => {
          const source = r.get('source');
          const target = r.get('target');
          if (!nodes.some((node) => node.label === source)) {
            nodes.push({label: source, data: {}});
          }
          if (!nodes.some((node) => node.label === target)) {
            nodes.push({label: target, data: {}});
          }
          return {source, target};
        });
      } else if (selectedNetwork === 'movies') {
        res = await session.run('MATCH p=()-[r:ACTED_IN]->() RETURN p');
        await session.close();
        edges = res.records.map((r) => {
          const path = r.get('p');
          const source = path.start.properties.name;
          const target = path.end.properties.title;
          if (!nodes.some((node) => node.label === source)) {
            nodes.push({
              label: source,
              data: {
                type: 'actor'
              }
            });
          }
          if (!nodes.some((node) => node.label === target)) {
            nodes.push({
              label: target,
              data: {
                type: 'movie'
              }
            });
          }
          return {source, target};
        });
      }
      setElements({
        nodes,
        edges
      });
    }
  };

  return (
    <div className="start-screen">
      <MenuElement headline="SettingsMenu" simpleHeader>
        <Select
          options={networks}
          value={selectedNetwork}
          setSelected={setSelectedNetwork}
          defaultOption="- Select Network -"
          className="extra-wide"
        />
        <Checkbox text="Layout in 2 Dimensions" checked={use2Dimensions} setChecked={setUse2Dimensions} name="dimension"/>
        <div className="button-wrapper">
          <Button text="Create Graph" onClick={getNetworkData}/>
          {isLoading && <Loader/>}
        </div>
      </MenuElement>
    </div>
  );
};

export default StartScreen;
