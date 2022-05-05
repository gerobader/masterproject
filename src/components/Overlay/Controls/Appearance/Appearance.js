import React, {useState, useMemo, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import MenuSwitch from '../../UI/MenuSwitch/MenuSwitch';
import ColorPicker from '../../UI/ColorPicker/ColorPicker';
import Button from '../../UI/Button/Button';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Select from '../../UI/Select/Select';
import SmallNumberInput from '../../UI/SmallNumberInput/SmallNumberInput';
import ColorRangePicker from '../../UI/ColorRangePicker/ColorRangePicker';
import {calculateColorForElement, sortArray, sortElements} from '../../../utility';
import RangeInput from '../../UI/RangeInput/RangeInput';
import Setting from '../../UI/Setting/Setting';
import ExpandableSetting from '../../UI/ExpandableSetting/ExpandableSetting';
import {setNodes} from '../../../../redux/network/network.actions';
import {addToActionHistory} from '../../../../redux/settings/settings.actions';

import './Appearance.scss';

const shapes = [
  'Box', 'Cone', 'Cylinder', 'Dodecahedron', 'Icosahedron', 'Octahedron', 'Sphere', 'Tetrahedron', 'Torus', 'Torus Knot'
];
const rangeMappingValues = ['degree', 'closeness', 'betweenness', 'lcc'];

const Appearance = () => {
  const {
    nodes, selectedNodes, edges, selectedEdges
  } = useSelector((state) => state.network);
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
  const [elementColorMapIndicators, setElementColorMapIndicators] = useState([]);
  const [elementSizeMappingValue, setElementSizeMappingValue] = useState();
  const [elementSizeMapping, setElementSizeMapping] = useState([]);
  const [nodeShapeMappingValue, setNodeShapeMappingValue] = useState();
  const [nodeShapeMapping, setNodeShapeMapping] = useState([]);
  const [labelColorMappingValue, setLabelColorMappingValue] = useState();
  const [labelColorMapIndicators, setLabelColorMapIndicators] = useState([]);
  const [labelSizeMappingValue, setLabelSizeMappingValue] = useState();
  const [labelSizeMapping, setLabelSizeMapping] = useState([]);
  const nodeDataPoints = useMemo(() => {
    const data = {};
    nodes.forEach((node) => {
      Object.keys(node.data).forEach((dataPoint) => {
        if (dataPoint in data) {
          if (!data[dataPoint].includes(node.data[dataPoint])) {
            data[dataPoint].push(node.data[dataPoint]);
          }
        } else {
          data[dataPoint] = [node.data[dataPoint]];
        }
      });
    });
    rangeMappingValues.forEach((mappingValue) => {
      if (mappingValue in data) {
        data[mappingValue].sort((a, b) => sortArray(a, b));
      }
    });
    return data;
  }, [nodes]);

  useEffect(() => {
    if (selectedNodes.length === 1) {
      setFillColor(selectedNodes[0].color);
    }
  }, [selectedNodes]);

  const applyColorMapping = (colorMapIndicators, mappingValue, targetElement) => {
    const changes = [];
    if (rangeMappingValues.includes(mappingValue)) {
      const sortedElements = sortElements(applyOnlyToSelected ? selectedNodes : nodes, mappingValue);
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
          const elementChanges = {element, type: 'graphElement'};
          if (targetElement === 'node' && typeof element.object.setColor === 'function') {
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
      dispatch(setNodes(nodes));
    } else if (mappingValue) {
      nodes.forEach((node) => {
        const elementChanges = {element: node, type: 'graphElement'};
        if (targetElement === 'node') {
          elementChanges.setColor = {before: node.color, after: colorMapIndicators[node.data[mappingValue]]};
          changes.push(elementChanges);
          node.setColor(colorMapIndicators[node.data[mappingValue]]);
        } else {
          elementChanges.setLabelColor = {before: node.label.color, after: colorMapIndicators[node.data[mappingValue]]};
          changes.push(elementChanges);
          node.setLabelColor(colorMapIndicators[node.data[mappingValue]]);
        }
      });
      dispatch(addToActionHistory(changes));
      dispatch(setNodes(nodes));
    }
  };

  const applySizeMapping = (mappingValue, sizeMapping, targetElement) => {
    const changes = [];
    const elementsToUse = applyOnlyToSelected ? selectedNodes : nodes;
    if (rangeMappingValues.includes(mappingValue)) {
      if (sizeMapping.length === 2 && !sizeMapping.includes(NaN)) {
        const sortedElements = sortElements(elementsToUse, mappingValue);
        const min = parseFloat(sizeMapping[0]);
        const max = parseFloat(sizeMapping[1]);
        sortedElements.forEach((element) => {
          const elementChanges = {element, type: 'graphElement'};
          const newSize = min + ((max - min) * (element.percentage / 100));
          if (targetElement === 'node' && typeof element.object.setSize === 'function') {
            elementChanges.setSize = {before: element.object.size, after: newSize};
            changes.push(elementChanges);
            element.object.setSize(newSize);
          } else if (targetElement === 'label' && typeof element.object.setLabelSize === 'function') {
            elementChanges.setLabelSize = {before: element.object.label.size, after: newSize};
            changes.push(elementChanges);
            element.object.setLabelSize(newSize);
          }
        });
        dispatch(addToActionHistory(changes));
        dispatch(setNodes(nodes));
      }
    } else if (mappingValue) {
      elementsToUse.forEach((node) => {
        const elementChanges = {element: node, type: 'graphElement'};
        if (targetElement === 'node') {
          elementChanges.setSize = {before: node.size, after: sizeMapping[node.data[mappingValue]]};
          changes.push(elementChanges);
          node.setSize(sizeMapping[node.data[mappingValue]]);
        } else {
          elementChanges.setLabelSize = {before: node.label.size, after: sizeMapping[node.data[mappingValue]]};
          changes.push(elementChanges);
          node.setLabelSize(sizeMapping[node.data[mappingValue]]);
        }
      });
      dispatch(addToActionHistory(changes));
      dispatch(setNodes(nodes));
    }
  };

  const applyNodeShapeMapping = (dataToMapOn, dataMapping) => {
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
      if (elementColorMappingValue) applyColorMapping(elementColorMapIndicators, elementColorMappingValue, 'node');
      if (labelColorMappingValue) applyColorMapping(labelColorMapIndicators, labelColorMappingValue, 'label');
      applySizeMapping(elementSizeMappingValue, elementSizeMapping, 'node');
      applySizeMapping(labelSizeMappingValue, labelSizeMapping, 'label');
      if (nodeShapeMappingValue && Object.keys(nodeShapeMapping).length > 0) {
        applyNodeShapeMapping(nodeShapeMappingValue, nodeShapeMapping);
      }
    } else {
      let elementsToEdit = [];
      if (elementType === 'Nodes' || elementType === 'Both') {
        if (applyOnlyToSelected) {
          elementsToEdit = [...selectedNodes];
        } else {
          elementsToEdit = [...nodes];
        }
      }
      if (elementType === 'Edges' || elementType === 'Both') {
        if (applyOnlyToSelected) {
          elementsToEdit = [...elementsToEdit, ...selectedEdges];
        } else {
          elementsToEdit = [...elementsToEdit, ...edges];
        }
      }
      const changes = [];
      elementsToEdit.forEach((element) => {
        const elementChanges = {element, type: 'graphElement'};
        if (fillColor && typeof element.setColor === 'function' && element.color !== fillColor) {
          elementChanges.setColor = {before: element.color, after: fillColor};
          element.setColor(fillColor);
        }
        if (elementSize && typeof element.setSize === 'function' && element.size !== elementSize) {
          elementChanges.setSize = {before: element.size, after: elementSize};
          element.setSize(parseFloat(elementSize));
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

  const createMappingInputs = (mappingType, mappingValue, rangeMapping, rangeMappingSetter) => {
    if (rangeMappingValues.includes(mappingValue) && mappingType !== 'shape') {
      return (
        <Setting name="Range">
          {mappingType === 'color' ? (<ColorRangePicker indicators={rangeMapping} setIndicators={rangeMappingSetter}/>)
            : (<RangeInput range={rangeMapping} setRange={rangeMappingSetter}/>)}
        </Setting>
      );
    }
    if (mappingValue) {
      if (mappingType === 'size') {
        return nodeDataPoints[mappingValue].map((dataPoint) => (
          <Setting key={dataPoint} name={dataPoint}>
            <SmallNumberInput
              value={rangeMapping[dataPoint]}
              setValue={(value) => rangeMappingSetter({...rangeMapping, [dataPoint]: value})}
            />
          </Setting>
        ));
      }
      if (mappingType === 'color') {
        return nodeDataPoints[mappingValue].map((dataPoint) => (
          <Setting key={dataPoint} name={dataPoint}>
            <ColorPicker
              color={rangeMapping[dataPoint]}
              setColor={(value) => rangeMappingSetter({...rangeMapping, [dataPoint]: value})}
            />
          </Setting>
        ));
      }
      return (expanded) => nodeDataPoints[mappingValue].map((dataPoint) => (
        <Setting key={dataPoint} name={dataPoint}>
          <Select
            options={shapes}
            value={rangeMapping[dataPoint]}
            setSelected={(option) => rangeMappingSetter({...rangeMapping, [dataPoint]: option})}
            parentOpenState={expanded}
            className="overflow-fix"
          />
        </Setting>
      ));
    }
    return null;
  };

  return (
    <div className="appearance-controls">
      <MenuSwitch setActiveMenu={setActiveMenu} activeMenu={activeMenu}/>
      {activeMenu === 'left' ? (
        <div className="settings">
          <Setting name="Element Color">
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
          <Setting name="Element Size">
            <SmallNumberInput value={elementSize} setValue={setElementSize}/>
            {elementSize !== undefined && (
              <Button text="reset" className="reset" onClick={() => setElementSize(undefined)}/>
            )}
          </Setting>
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
          <Setting name="Label Color">
            <ColorPicker color={labelColor} setColor={setLabelColor}/>
            {labelColor && (<Button text="reset" className="reset" onClick={() => setLabelColor(undefined)}/>)}
          </Setting>
          <Setting name="Label Size">
            <SmallNumberInput value={labelSize} setValue={setLabelSize}/>
            {labelSize && (<Button text="reset" className="reset" onClick={() => setLabelSize(undefined)}/>)}
          </Setting>
        </div>
      ) : (
        <div className="settings">
          <ExpandableSetting
            name="Element Color"
            mappingValue={elementColorMappingValue}
            setMappingValue={(mappingValue) => {
              setElementColorMappingValue(mappingValue);
              setElementColorMapIndicators([]);
            }}
            mappingOptions={Object.keys(nodeDataPoints)}
          >
            {createMappingInputs('color', elementColorMappingValue, elementColorMapIndicators, setElementColorMapIndicators)}
          </ExpandableSetting>
          <ExpandableSetting
            name="Element Size"
            mappingValue={elementSizeMappingValue}
            setMappingValue={(mappingValue) => {
              setElementSizeMappingValue(mappingValue);
              setElementSizeMapping([]);
            }}
            mappingOptions={Object.keys(nodeDataPoints)}
          >
            {createMappingInputs('size', elementSizeMappingValue, elementSizeMapping, setElementSizeMapping)}
          </ExpandableSetting>
          <ExpandableSetting
            name="Node Shape"
            mappingValue={nodeShapeMappingValue}
            setMappingValue={setNodeShapeMappingValue}
            mappingOptions={Object.keys(nodeDataPoints)}
          >
            {createMappingInputs('shape', nodeShapeMappingValue, nodeShapeMapping, setNodeShapeMapping)}
          </ExpandableSetting>
          <ExpandableSetting
            name="Label Color"
            mappingValue={labelColorMappingValue}
            setMappingValue={setLabelColorMappingValue}
            mappingOptions={Object.keys(nodeDataPoints)}
          >
            {createMappingInputs('color', labelColorMappingValue, labelColorMapIndicators, setLabelColorMapIndicators)}
          </ExpandableSetting>
          <ExpandableSetting
            name="Label Size"
            mappingValue={labelSizeMappingValue}
            setMappingValue={setLabelSizeMappingValue}
            mappingOptions={Object.keys(nodeDataPoints)}
          >
            {createMappingInputs('size', labelSizeMappingValue, labelSizeMapping, setLabelSizeMapping)}
          </ExpandableSetting>
        </div>
      )}
      <div className="controls">
        <Select
          options={['Nodes', 'Edges', 'Both']}
          value={elementType}
          setSelected={setElementType}
          opensUp
          alwaysShowArrow
        />
        {(selectedNodes.length || selectedEdges.length) ? (
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
