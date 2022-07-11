import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import EdgeMappingMenu from './EdgeMappingMenu/EdgeMappingMenu';
import NodeMappingMenu from './NodeMappingMenu/NodeMappingMenu';
import MenuElement from '../../UI/MenuElement/MenuElement';
import MenuSwitch from '../../UI/MenuSwitch/MenuSwitch';
import ColorPicker from '../../UI/ColorPicker/ColorPicker';
import Button from '../../UI/Button/Button';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Select from '../../UI/Select/Select';
import Setting from '../../UI/Setting/Setting';
import SmallNumberInput from '../../UI/SmallNumberInput/SmallNumberInput';
import {calculateColorForElement} from '../../../utility';
import {setNodes, setEdges} from '../../../../redux/network/network.actions';
import {addToActionHistory} from '../../../../redux/settings/settings.actions';
import {shapes} from '../../../constants';

import './Appearance.scss';
import appearanceIcon from '../../../../assets/appearance-icon.svg';

const Appearance = () => {
  const {
    nodes, selectedNodes, edges, selectedEdges
  } = useSelector((state) => state.network);
  const {performanceMode} = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const [activeMenu, setActiveMenu] = useState('left');
  const [fillColor, setFillColor] = useState();
  const [elementSize, setElementSize] = useState();
  const [labelColor, setLabelColor] = useState();
  const [labelSize, setLabelSize] = useState();
  const [nodeShape, setNodeShape] = useState();
  const [applyOnlyToSelected, setApplyOnlyToSelected] = useState(false);
  const [elementType, setElementType] = useState('Nodes');

  const [nodeColorMappingValue, setNodeColorMappingValue] = useState();
  const [nodeColorMappingType, setNodeColorMappingType] = useState('absolute');
  const [nodeColorMapIndicators, setNodeColorMapIndicators] = useState([]);
  const [nodeSizeMappingValue, setNodeSizeMappingValue] = useState();
  const [nodeSizeMappingType, setNodeSizeMappingType] = useState('absolute');
  const [nodeSizeMapping, setNodeSizeMapping] = useState([]);
  const [nodeShapeMappingValue, setNodeShapeMappingValue] = useState();
  const [nodeShapeMapping, setNodeShapeMapping] = useState([]);
  const [labelColorMappingValue, setLabelColorMappingValue] = useState();
  const [labelColorMappingType, setLabelColorMappingType] = useState('absolute');
  const [labelColorMapIndicators, setLabelColorMapIndicators] = useState([]);
  const [labelSizeMappingValue, setLabelSizeMappingValue] = useState();
  const [labelSizeMappingType, setLabelSizeMappingType] = useState('absolute');
  const [labelSizeMapping, setLabelSizeMapping] = useState([]);
  const [edgeColorMappingValue, setEdgeColorMappingValue] = useState();
  const [edgeColorMappingType, setEdgeColorMappingType] = useState();
  const [edgeColorMapIndicators, setEdgeColorMapIndicators] = useState([]);
  const [edgeSizeMappingValue, setEdgeSizeMappingValue] = useState();
  const [edgeSizeMappingType, setEdgeSizeMappingType] = useState();
  const [edgeSizeMapping, setEdgeSizeMapping] = useState([]);

  useEffect(() => {
    if (selectedNodes.length === 1) {
      setFillColor(selectedNodes[0].color);
    }
  }, [selectedNodes]);

  useEffect(() => {
    if (selectedEdges.length + selectedNodes.length === 0) {
      setApplyOnlyToSelected(false);
    }
  }, [selectedEdges, selectedNodes]);

  // reset mapping values when mapping type changes
  useEffect(() => setNodeSizeMapping([]), [nodeSizeMappingType]);
  useEffect(() => setNodeColorMapIndicators([]), [nodeColorMappingType]);
  useEffect(() => setLabelColorMapIndicators([]), [labelColorMappingType]);
  useEffect(() => setLabelSizeMapping([]), [labelSizeMappingType]);
  useEffect(() => setEdgeColorMapIndicators([]), [edgeColorMappingType]);
  useEffect(() => setEdgeSizeMapping([]), [edgeSizeMappingType]);

  const getElementsToUse = () => {
    let elementsToUse = [];
    if (elementType === 'Nodes') elementsToUse = applyOnlyToSelected ? selectedNodes : nodes;
    if (elementType === 'Edges') elementsToUse = applyOnlyToSelected ? selectedEdges : edges;
    return elementsToUse;
  };

  const applyColorMapping = (colorMapIndicators, mappingValue, mappingType, targetElement) => {
    if (!mappingValue || colorMapIndicators.length === 0) return;
    const changes = [];
    const elementsToUse = getElementsToUse();
    if (mappingType === 'relative') {
      const allValues = elementType === 'Nodes'
        ? nodes.map((node) => node.data[mappingValue]) : edges.map((edge) => edge.data[mappingValue]);
      const minValue = Math.min(...allValues);
      const maxValue = Math.max(...allValues);
      const sortedColorMapIndicators = [...colorMapIndicators];
      sortedColorMapIndicators.sort((first, second) => {
        if (first.position === second.position) return 0;
        return first.position > second.position ? 1 : -1;
      });
      elementsToUse.forEach((element) => {
        const elementPercentage = Math.ceil(((element.data[mappingValue] - minValue) / (maxValue - minValue)) * 100);
        const upperColorBoundIndicator = sortedColorMapIndicators.find(
          (colorIndicator) => colorIndicator.positionPercent > elementPercentage
        );
        const lowerColorBoundIndicator = sortedColorMapIndicators.filter(
          (colorIndicator) => colorIndicator.positionPercent <= elementPercentage
        ).pop();
        const color = calculateColorForElement(lowerColorBoundIndicator, upperColorBoundIndicator, elementPercentage);
        if (color) {
          const elementChanges = {element, type: 'graphElement'};
          if ((targetElement === 'node' || targetElement === 'edge') && typeof element.setColor === 'function') {
            elementChanges.setColor = {before: element.color, after: color};
            changes.push(elementChanges);
            element.setColor(color);
          } else if (targetElement === 'label' && typeof element.setLabelColor === 'function') {
            elementChanges.setLabelColor = {before: element.label.color, after: color};
            changes.push(elementChanges);
            element.setLabelColor(color);
          }
        }
      });
      dispatch(addToActionHistory(changes));
      if (targetElement === 'edge') dispatch(setEdges(edges));
      else dispatch(setNodes(nodes));
    } else {
      elementsToUse.forEach((element) => {
        const elementChanges = {element, type: 'graphElement'};
        if (targetElement === 'node' || targetElement === 'edge') {
          elementChanges.setColor = {before: element.color, after: colorMapIndicators[element.data[mappingValue]]};
          changes.push(elementChanges);
          element.setColor(colorMapIndicators[element.data[mappingValue]]);
        } else {
          elementChanges.setLabelColor = {before: element.label.color, after: colorMapIndicators[element.data[mappingValue]]};
          changes.push(elementChanges);
          element.setLabelColor(colorMapIndicators[element.data[mappingValue]]);
        }
      });
      dispatch(addToActionHistory(changes));
      dispatch(setNodes(nodes));
    }
  };

  const applySizeMapping = (mappingValue, mappingType, sizeMapping, targetElement) => {
    if (!mappingValue) return;
    const changes = [];
    const elementsToUse = getElementsToUse();
    if (mappingType === 'relative') {
      if (sizeMapping.length === 2 && !sizeMapping.includes(NaN)) {
        const allValues = elementType === 'Nodes'
          ? nodes.map((node) => node.data[mappingValue]) : edges.map((edge) => edge.data[mappingValue]);
        const minValue = Math.min(...allValues);
        const maxValue = Math.max(...allValues);
        const min = parseFloat(sizeMapping[0]);
        const max = parseFloat(sizeMapping[1]);
        elementsToUse.forEach((element) => {
          const elementPercentage = (element.data[mappingValue] - minValue) / (maxValue - minValue);
          const elementChanges = {element, type: 'graphElement'};
          const newSize = min + ((max - min) * elementPercentage);
          if (targetElement === 'label' && typeof element.setLabelSize === 'function') {
            elementChanges.setLabelSize = {before: element.label.size, after: newSize};
            changes.push(elementChanges);
            element.setLabelSize(newSize);
          } else {
            elementChanges.setSize = {before: element.size, after: newSize};
            changes.push(elementChanges);
            element.setSize(newSize);
          }
        });
        dispatch(addToActionHistory(changes));
        dispatch(setNodes(nodes));
      }
    } else {
      elementsToUse.forEach((element) => {
        const elementChanges = {element, type: 'graphElement'};
        if (targetElement === 'label') {
          elementChanges.setLabelSize = {before: element.label.size, after: sizeMapping[element.data[mappingValue]]};
          changes.push(elementChanges);
          element.setLabelSize(sizeMapping[element.data[mappingValue]]);
        } else {
          elementChanges.setSize = {before: element.size, after: sizeMapping[element.data[mappingValue]]};
          changes.push(elementChanges);
          element.setSize(sizeMapping[element.data[mappingValue]]);
        }
      });
      dispatch(addToActionHistory(changes));
      dispatch(setNodes(nodes));
    }
  };

  const applyNodeShapeMapping = (dataToMapOn, dataMapping) => {
    if (!dataToMapOn && Object.keys(nodeShapeMapping).length === 0) return;
    const changes = [];
    nodes.forEach((node) => {
      const nodeData = node.data[dataToMapOn];
      const shape = dataMapping[nodeData];
      node.setShape(shape);
      const elementChanges = {element: node, type: 'graphElement'};
      elementChanges.setShape = {before: node.shape, after: shape};
      changes.push(elementChanges);
    });
    dispatch(addToActionHistory(changes));
    dispatch(setNodes(nodes));
  };

  const applyChanges = () => {
    if (activeMenu === 'right') {
      if (elementType === 'Nodes') {
        applyColorMapping(nodeColorMapIndicators, nodeColorMappingValue, nodeColorMappingType, 'node');
        applyColorMapping(labelColorMapIndicators, labelColorMappingValue, labelColorMappingType, 'label');
        applyNodeShapeMapping(nodeShapeMappingValue, nodeShapeMapping);
        applySizeMapping(nodeSizeMappingValue, nodeSizeMappingType, nodeSizeMapping, 'node');
        applySizeMapping(labelSizeMappingValue, labelSizeMappingType, labelSizeMapping, 'label');
      }
      if (elementType === 'Edges') {
        applySizeMapping(edgeSizeMappingValue, edgeSizeMappingType, edgeSizeMapping, 'edge');
        applyColorMapping(edgeColorMapIndicators, edgeColorMappingValue, edgeColorMappingType, 'edge');
      }
    } else {
      const elementsToUse = getElementsToUse();
      const changes = [];
      elementsToUse.forEach((element) => {
        const elementChanges = {element, type: 'graphElement'};
        if (fillColor && typeof element.setColor === 'function' && element.color !== fillColor) {
          elementChanges.setColor = {before: element.color, after: fillColor};
          element.setColor(fillColor);
        }
        if (elementSize && typeof element.setSize === 'function' && element.size !== elementSize) {
          elementChanges.setSize = {before: element.size, after: parseFloat(elementSize)};
          element.setSize(elementSize);
        }
        if (labelColor && typeof element.setLabelColor === 'function' && element.label && element.label.color !== labelColor) {
          elementChanges.setLabelColor = {before: element.label?.color, after: labelColor};
          element.setLabelColor(labelColor);
        }
        if (labelSize && typeof element.setLabelSize === 'function' && element.label && element.label.size !== labelSize) {
          elementChanges.setLabelSize = {before: element.label?.size, after: labelSize};
          element.setLabelSize(parseFloat(labelSize));
        }
        if (nodeShape && typeof element.setShape === 'function' && element.shape !== nodeShape) {
          elementChanges.setShape = {before: element.shape, after: nodeShape};
          element.setShape(nodeShape);
        }
        changes.push(elementChanges);
      });
      dispatch(addToActionHistory(changes));
      dispatch(setNodes(nodes));
    }
  };

  const renderMappingMenu = () => (elementType === 'Nodes' ? (
    <NodeMappingMenu
      nodeColorMappingValue={nodeColorMappingValue}
      setNodeColorMappingValue={setNodeColorMappingValue}
      setNodeColorMapIndicators={setNodeColorMapIndicators}
      nodeColorMapIndicators={nodeColorMapIndicators}
      nodeColorMappingType={nodeColorMappingType}
      setNodeColorMappingType={setNodeColorMappingType}
      nodeSizeMappingValue={nodeSizeMappingValue}
      setNodeSizeMappingValue={setNodeSizeMappingValue}
      setNodeSizeMapping={setNodeSizeMapping}
      nodeSizeMappingType={nodeSizeMappingType}
      setNodeSizeMappingType={setNodeSizeMappingType}
      nodeSizeMapping={nodeSizeMapping}
      nodeShapeMappingValue={nodeShapeMappingValue}
      setNodeShapeMappingValue={setNodeShapeMappingValue}
      nodeShapeMapping={nodeShapeMapping}
      setNodeShapeMapping={setNodeShapeMapping}
      labelColorMappingValue={labelColorMappingValue}
      setLabelColorMappingValue={setLabelColorMappingValue}
      labelColorMappingType={labelColorMappingType}
      setLabelColorMappingType={setLabelColorMappingType}
      labelColorMapIndicators={labelColorMapIndicators}
      setLabelColorMapIndicators={setLabelColorMapIndicators}
      labelSizeMappingValue={labelSizeMappingValue}
      setLabelSizeMappingValue={setLabelSizeMappingValue}
      labelSizeMappingType={labelSizeMappingType}
      setLabelSizeMappingType={setLabelSizeMappingType}
      labelSizeMapping={labelSizeMapping}
      setLabelSizeMapping={setLabelSizeMapping}
    />
  ) : (
    <EdgeMappingMenu
      edgeColorMappingValue={edgeColorMappingValue}
      setEdgeColorMappingValue={setEdgeColorMappingValue}
      setEdgeColorMapIndicators={setEdgeColorMapIndicators}
      edgeColorMapIndicators={edgeColorMapIndicators}
      edgeColorMappingType={edgeColorMappingType}
      setEdgeColorMappingType={setEdgeColorMappingType}
      edgeSizeMappingValue={edgeSizeMappingValue}
      setEdgeSizeMappingValue={setEdgeSizeMappingValue}
      setEdgeSizeMapping={setEdgeSizeMapping}
      edgeSizeMappingType={edgeSizeMappingType}
      setEdgeSizeMappingType={setEdgeSizeMappingType}
      edgeSizeMapping={edgeSizeMapping}
    />
  ));

  return (
    <MenuElement headline="Appearance" icon={appearanceIcon}>
      <div className="appearance-controls">
        <MenuSwitch setActiveMenu={setActiveMenu} activeMenu={activeMenu}/>
        {activeMenu === 'left' ? (
          <div className="settings">
            <Setting name={`${elementType.slice(0, -1)} Color`}>
              <ColorPicker
                color={fillColor}
                setColor={setFillColor}
                disabled={selectedNodes.length === 1 && selectedNodes[0].colorLocked}
              />
              {(selectedNodes.length === 1) && (
                <div
                  className={`lock${selectedNodes[0].colorLocked ? ' is-locked' : ''}`}
                  onClick={() => {
                    selectedNodes[0].colorLocked = !selectedNodes[0].colorLocked;
                    dispatch(setNodes(nodes));
                  }}
                />
              )}
              {fillColor && (<Button text="reset" className="reset" onClick={() => setFillColor(undefined)}/>)}
            </Setting>
            <Setting name={`${elementType.slice(0, -1)} Size`}>
              <SmallNumberInput value={elementSize} setValue={setElementSize}/>
              {elementSize !== undefined && (
                <Button text="reset" className="reset" onClick={() => setElementSize(undefined)}/>
              )}
            </Setting>
            {(!performanceMode && elementType === 'Nodes') && (
              <Setting name="Node Shape">
                <Select
                  options={shapes}
                  value={nodeShape}
                  setSelected={setNodeShape}
                  className="no-margin"
                  defaultOption="- Shape -"
                />
                {nodeShape && (<Button text="reset" className="reset" onClick={() => setNodeShape(undefined)}/>)}
              </Setting>
            )}
            {elementType === 'Nodes' && (
              <>
                <Setting name="Label Color">
                  <ColorPicker color={labelColor} setColor={setLabelColor}/>
                  {labelColor && (<Button text="reset" className="reset" onClick={() => setLabelColor(undefined)}/>)}
                </Setting>
                <Setting name="Label Size">
                  <SmallNumberInput value={labelSize} setValue={setLabelSize}/>
                  {labelSize && (<Button text="reset" className="reset" onClick={() => setLabelSize(undefined)}/>)}
                </Setting>
              </>
            )}
          </div>
        ) : renderMappingMenu()}
        <div className="controls">
          <Select
            options={['Nodes', 'Edges']}
            value={elementType}
            setSelected={setElementType}
            opensUp
            alwaysShowArrow
          />
          {((elementType === 'Nodes' && selectedNodes.length) || (elementType === 'Edges' && selectedEdges.length)) ? (
            <Checkbox
              name="use-only-selected"
              text="Only selected"
              checked={applyOnlyToSelected}
              setChecked={setApplyOnlyToSelected}
            />
          ) : ''}
          <Button text="Apply" onClick={applyChanges}/>
        </div>
      </div>
    </MenuElement>
  );
};

export default Appearance;
