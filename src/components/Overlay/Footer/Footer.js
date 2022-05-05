import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import InfoTable from './InfoTable/InfoTable';
import ProgressBar from './ProgressBar/ProgressBar';
import SettingsMenu from './SettingsMenu/SettingsMenu';
import LabelSwitch from './LabelSwitch/LabelSwitch';
import {setCurrentHistoryPosition} from '../../../redux/settings/settings.actions';
import {setNodes} from '../../../redux/network/network.actions';
import {setFilterCollection} from '../../../redux/filter/filter.action';
import {calculateAveragePosition} from '../../utility';

import './Footer.scss';

const Footer = () => {
  const {
    nodes, edges, selectedNodes, selectedEdges, averagePositionPlaceholder
  } = useSelector((state) => state.network);
  const {actionHistory, currentHistoryPosition} = useSelector((state) => state.settings);
  const [progressInfo, setProgressInfo] = useState();
  const [showInfoTable, setShowInfoTable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dispatch = useDispatch();

  const undoAction = () => {
    if (currentHistoryPosition > 0) {
      const actionsToUndo = actionHistory[currentHistoryPosition - 1];
      actionsToUndo.forEach((action) => {
        if (action.type === 'graphElement') {
          const actionTypes = Object.keys(action);
          actionTypes.forEach((actionType) => {
            if (typeof action.element[actionType] === 'function') {
              action.element[actionType](action[actionType].before);
            }
          });
        } else if (action.type === 'filterChange') {
          dispatch(setFilterCollection(action.before));
        }
      });
      if (averagePositionPlaceholder) {
        const averagePosition = calculateAveragePosition(selectedNodes);
        averagePositionPlaceholder.position.set(averagePosition.x, averagePosition.y, averagePosition.z);
      }
      dispatch(setCurrentHistoryPosition(currentHistoryPosition - 1));
      dispatch(setNodes(nodes));
    }
  };

  const redoAction = () => {
    if (currentHistoryPosition < actionHistory.length) {
      const actionsToRedo = actionHistory[currentHistoryPosition];
      actionsToRedo.forEach((action) => {
        if (action.type === 'graphElement') {
          const actionTypes = Object.keys(action);
          actionTypes.forEach((actionType) => {
            if (typeof action.element[actionType] === 'function') {
              action.element[actionType](action[actionType].after);
            }
          });
        } else if (action.type === 'filterChange') {
          dispatch(setFilterCollection(action.after));
        }
      });
      if (averagePositionPlaceholder) {
        const averagePosition = calculateAveragePosition(selectedNodes);
        averagePositionPlaceholder.position.set(averagePosition.x, averagePosition.y, averagePosition.z);
      }
      dispatch(setCurrentHistoryPosition(currentHistoryPosition + 1));
      dispatch(setNodes(nodes));
    }
  };

  const functionShortcuts = (e) => {
    const {key, ctrlKey, shiftKey} = e;
    if (key.toLowerCase() === 'z' && ctrlKey) {
      e.preventDefault();
      if (shiftKey) redoAction();
      else undoAction();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', functionShortcuts);
    return () => {
      window.removeEventListener('keydown', functionShortcuts);
    };
  }, [functionShortcuts]);

  return (
    <div className="footer-wrapper">
      {showInfoTable && <InfoTable setProgressInfo={setProgressInfo}/>}
      {showSettings && (
        <SettingsMenu hideSettings={() => setShowSettings(false)} undoAction={undoAction} redoAction={redoAction}/>
      )}
      <div className="footer">
        <div className="left-info">
          <p className="margin-right">
            {`Nodes: ${nodes.length}${selectedNodes.length ? ` (${selectedNodes.length})` : ''}
            ${selectedNodes.length === 1 ? ` (${selectedNodes[0].name})` : ''}`}
          </p>
          <p className="margin-right">
            {`Edges: ${edges.length}${selectedEdges.length ? ` (${selectedEdges.length})` : ''}`}
          </p>
          <ProgressBar progressInfo={progressInfo}/>
        </div>
        <div className="right-button-wrapper">
          <LabelSwitch/>
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
