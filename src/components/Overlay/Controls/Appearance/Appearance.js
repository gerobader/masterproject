import React, {useState, useMemo, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import MenuSwitch from '../../UI/MenuSwitch/MenuSwitch';
import ColorPicker from '../../UI/ColorPicker/ColorPicker';
import Button from '../../UI/Button/Button';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Select from '../../UI/Select/Select';
import SmallNumberInput from '../../UI/SmallNumberInput/SmallNumberInput';
import {calculateColorForElement, sortElements} from '../../../utility';
import Setting from '../../UI/Setting/Setting';
import NodeMappingMenu from './NodeMappingMenu/NodeMappingMenu';
import {setNodes, setEdges} from '../../../../redux/network/network.actions';
import {addToActionHistory} from '../../../../redux/settings/settings.actions';
import {shapes} from '../../../constants';

import './Appearance.scss';
import EdgeMappingMenu from './EdgeMappingMenu/EdgeMappingMenu';

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
  const [applyOnlyToSelected, setApplyOnlyToSelected] = useState(false);
  const [elementType, setElementType] = useState('Nodes');
  const [nodeShape, setNodeShape] = useState();

  const [elementColorMappingValue, setElementColorMappingValue] = useState();
  const [elementColorMappingType, setElementColorMappingType] = useState('absolute');
  const [elementColorMapIndicators, setElementColorMapIndicators] = useState([]);
  const [elementSizeMappingValue, setElementSizeMappingValue] = useState();
  const [elementSizeMappingType, setElementSizeMappingType] = useState('absolute');
  const [elementSizeMapping, setElementSizeMapping] = useState([]);
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
  useEffect(() => setElementSizeMapping([]), [elementSizeMappingType]);
  useEffect(() => setElementColorMapIndicators([]), [elementColorMappingType]);
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
    if (!mappingValue) return;
    const changes = [];
    const elementsToUse = getElementsToUse();
    if (mappingType === 'relative') {
      if (elementsToUse.length < 2) return;
      const sortedElements = sortElements(elementsToUse, mappingValue);
      const sortedColorMapIndicators = [...colorMapIndicators];
      sortedColorMapIndicators.sort((first, second) => {
        if (first.position === second.position) return 0;
        return first.position > second.position ? 1 : -1;
      });
      sortedElements.forEach((element) => {
        const upperColorBoundIndicator = sortedColorMapIndicators.filter(
          (colorIndicator) => colorIndicator.positionPercent > element.percentage
        )[0];
        const lowerColorBoundIndicator = sortedColorMapIndicators.filter(
          (colorIndicator) => colorIndicator.positionPercent <= element.percentage
        ).pop();
        const color = calculateColorForElement(lowerColorBoundIndicator, upperColorBoundIndicator, element.percentage);
        if (color) {
          const elementChanges = {element: element.object, type: 'graphElement'};
          if ((targetElement === 'node' || targetElement === 'edge') && typeof element.object.setColor === 'function') {
            elementChanges.setColor = {before: element.object.color, after: color};
            changes.push(elementChanges);
            element.object.setColor(color);
          } else if (targetElement === 'label' && typeof element.object.setLabelColor === 'function') {
            elementChanges.setLabelColor = {before: element.object.label.color, after: color};
            changes.push(elementChanges);
            element.object.setLabelColor(color);
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
      if (elementsToUse.length < 2) return;
      if (sizeMapping.length === 2 && !sizeMapping.includes(NaN)) {
        const sortedElements = sortElements(elementsToUse, mappingValue);
        const min = parseFloat(sizeMapping[0]);
        const max = parseFloat(sizeMapping[1]);
        sortedElements.forEach((element) => {
          const elementChanges = {element: element.object, type: 'graphElement'};
          const newSize = min + ((max - min) * (element.percentage / 100));
          if (targetElement === 'label' && typeof element.object.setLabelSize === 'function') {
            elementChanges.setLabelSize = {before: element.object.label.size, after: newSize};
            changes.push(elementChanges);
            element.object.setLabelSize(newSize);
          } else {
            elementChanges.setSize = {before: element.object.size, after: newSize};
            changes.push(elementChanges);
            element.object.setSize(newSize);
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
        applyColorMapping(elementColorMapIndicators, elementColorMappingValue, elementColorMappingType, 'node');
        applyColorMapping(labelColorMapIndicators, labelColorMappingValue, labelColorMappingType, 'label');
        applyNodeShapeMapping(nodeShapeMappingValue, nodeShapeMapping);
        applySizeMapping(elementSizeMappingValue, elementSizeMappingType, elementSizeMapping, 'node');
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
      elementColorMappingValue={elementColorMappingValue}
      setElementColorMappingValue={setElementColorMappingValue}
      setElementColorMapIndicators={setElementColorMapIndicators}
      elementColorMapIndicators={elementColorMapIndicators}
      elementColorMappingType={elementColorMappingType}
      setElementColorMappingType={setElementColorMappingType}
      elementSizeMappingValue={elementSizeMappingValue}
      setElementSizeMappingValue={setElementSizeMappingValue}
      setElementSizeMapping={setElementSizeMapping}
      elementSizeMappingType={elementSizeMappingType}
      setElementSizeMappingType={setElementSizeMappingType}
      elementSizeMapping={elementSizeMapping}
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
  );
};

export default Appearance;
