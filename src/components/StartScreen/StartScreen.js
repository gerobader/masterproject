import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import * as neo4j from 'neo4j-driver';
import MenuElement from '../Overlay/MenuElement/MenuElement';
import Select from '../Overlay/UI/Select/Select';
import Button from '../Overlay/UI/Button/Button';
import Loader from '../Overlay/UI/Loader/Loader';
import Checkbox from '../Overlay/UI/Checkbox/Checkbox';
import {setPerformanceMode} from '../../redux/settings/settings.actions';
import {setNetworkName} from '../../redux/network/network.actions';

import * as miserables from '../../data/performanceTest/0_miserables_klein.json';
import * as middleSizedNetwork from '../../data/performanceTest/1_mittel.json';
import * as bigNetwork from '../../data/performanceTest/2_groesser.json';

import './StartScreen.scss';

const networks = ['gameofthrones', 'movies', 'twitter', 'smallSize', 'midSize', 'largeSize'];

const StartScreen = ({use2Dimensions, setUse2Dimensions, setNetworkInfo}) => {
  const {performanceMode} = useSelector((state) => state.settings);
  const [selectedNetwork, setSelectedNetwork] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const getTestNetworkInfo = (network) => {
    const testEdges = network.links;
    const testNodes = network.nodes.map((node) => {
      const newNode = {
        label: node.name,
        data: {
          group: node.group,
          component: node.component
        }
      };
      if (node.attributes && typeof node.attributes === 'object') {
        newNode.data = {
          ...newNode.data,
          ...node.attributes
        };
      }
      return newNode;
    });
    return {testNodes, testEdges};
  };

  const getNetworkData = async () => {
    if (selectedNetwork && !isLoading) {
      dispatch(setNetworkName(selectedNetwork));
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
      let isDirected = false;
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
        isDirected = true;
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
      } else if (selectedNetwork === 'twitter') {
        res = await session.run('MATCH p=()-[r:FOLLOWS]->() RETURN p LIMIT 15000');
        isDirected = true;
        await session.close();
        edges = res.records.map((r) => {
          const path = r.get('p');
          const source = path.start.properties.name;
          const target = path.end.properties.name;
          if (!nodes.find((node) => node.label === source)) {
            nodes.push({
              label: source,
              data: {
                followers: path.start.properties.followers.low,
                following: path.start.properties.following.low,
                location: path.start.properties.location
              }
            });
          }
          if (!nodes.find((node) => node.label === target)) {
            nodes.push({
              label: target,
              data: {
                followers: path.end.properties.followers.low,
                following: path.end.properties.following.low,
                location: path.end.properties.location

              }
            });
          }
          return {source, target};
        });
      } else if (selectedNetwork === 'smallSize') {
        const {testNodes, testEdges} = getTestNetworkInfo(miserables.default);
        edges = testEdges;
        testNodes.forEach((node) => nodes.push(node));
      } else if (selectedNetwork === 'midSize') {
        const {testNodes, testEdges} = getTestNetworkInfo(middleSizedNetwork.default);
        edges = testEdges;
        testNodes.forEach((node) => nodes.push(node));
      } else if (selectedNetwork === 'largeSize') {
        const {testNodes, testEdges} = getTestNetworkInfo(bigNetwork.default);
        edges = testEdges;
        testNodes.forEach((node) => nodes.push(node));
      }
      setNetworkInfo({
        nodes,
        edges,
        isDirected
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
        <Checkbox
          text="Layout in 2 Dimensions"
          checked={use2Dimensions}
          setChecked={setUse2Dimensions}
          name="dimension"
          className="dimension-check"
        />
        <Checkbox
          text="Performance Mode"
          checked={performanceMode}
          setChecked={() => dispatch(setPerformanceMode(!performanceMode))}
          name="performance"
          title="This will improve editor performance at the cost of some functionality. Recommended for large networks."
        />
        <div className="button-wrapper">
          <Button text="Create Graph" onClick={getNetworkData} disabled={!selectedNetwork}/>
          {isLoading && <Loader/>}
        </div>
      </MenuElement>
    </div>
  );
};

export default StartScreen;
