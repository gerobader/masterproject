import React, {useState, useMemo} from 'react';
import {useSelector} from 'react-redux';
import MenuSwitch from '../../UI/MenuSwitch/MenuSwitch';
import ColorPicker from '../../UI/ColorPicker/ColorPicker';
import Button from '../../UI/Button/Button';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Select from '../../UI/Select/Select';
import SmallNumberInput from '../../UI/SmallNumberInput/SmallNumberInput';
import ColorRangePicker from '../../UI/ColorRangePicker/ColorRangePicker';
import {calculateColorForElement, sortElements} from '../../../utility';
import RangeInput from '../../UI/RangeInput/RangeInput';
import Setting from '../../UI/Setting/Setting';
import ExpandableSetting from '../../UI/ExpandableSetting/ExpandableSetting';

import './Appearance.scss';

const shapes = [
  'Box', 'Cone', 'Cylinder', 'Dodecahedron', 'Icosahedron', 'Octahedron', 'Sphere', 'Tetrahedron', 'Torus', 'Torus Knot'
];

const Appearance = () => {
  const {
    nodes, selectedNodes, edges, selectedEdges
  } = useSelector((state) => state.networkElements);
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
    if ('edgeCount' in data) {
      data.edgeCount.sort((a, b) => {
        if (a === b) return 0;
        return a < b ? -1 : 1;
      });
    }
    return data;
  }, [nodes]);

  const applyColorMapping = (colorMapIndicators, mappingValue, targetElement) => {
    if (mappingValue === 'edgeCount') {
      const sortedElements = sortElements(applyOnlyToSelected ? selectedNodes : nodes);
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
          if (targetElement === 'node' && typeof element.object.setColor === 'function') {
            element.object.setColor(color);
          } else if (targetElement === 'label' && typeof element.object.setLabelColor === 'function') {
            element.object.setLabelColor(color);
          }
        }
      });
    } else if (mappingValue) {
      nodes.forEach((node) => {
        node.setColor(colorMapIndicators[node.data.type]);
      });
    }
  };

  const applyElementSizeMapping = (mappingValue, sizeMapping, targetElement) => {
    if (mappingValue === 'edgeCount') {
      if (elementSizeMapping.length === 2 && elementSizeMappingValue && !elementSizeMapping.includes(NaN)) {
        const sortedElements = sortElements(applyOnlyToSelected ? selectedNodes : nodes);
        const min = parseFloat(sizeMapping[0]);
        const max = parseFloat(sizeMapping[1]);
        sortedElements.forEach((element) => {
          if (targetElement === 'node' && typeof element.object.setSize === 'function') {
            element.object.setSize(min + ((max - min) * (element.percentage / 100)));
          } else if (targetElement === 'label' && typeof element.object.setLabelSize === 'function') {
            element.object.setLabelSize(min + ((max - min) * (element.percentage / 100)));
          }
        });
      }
    } else if (mappingValue) {
      nodes.forEach((node) => {
        node.setSize(sizeMapping[node.data.type]);
      });
    }
  };

  const applyNodeShapeMapping = (dataToMapOn, dataMapping) => {
    nodes.forEach((node) => {
      const nodeData = node.data[dataToMapOn];
      const shape = dataMapping[nodeData];
      node.setShape(shape);
    });
  };

  const applyChanges = () => {
    if (activeMenu === 'right') {
      if (elementColorMappingValue) applyColorMapping(elementColorMapIndicators, elementColorMappingValue, 'node');
      if (labelColorMappingValue) applyColorMapping(labelColorMapIndicators, labelColorMappingValue, 'label');
      applyElementSizeMapping(elementSizeMappingValue, elementSizeMapping, 'node');
      if (labelSizeMapping.length === 2 && labelSizeMappingValue && !labelSizeMapping.includes(NaN)) {
        applyElementSizeMapping(labelSizeMappingValue, labelSizeMapping, 'label');
      }
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
      elementsToEdit.forEach((element) => {
        if (fillColor && typeof element.setColor === 'function') element.setColor(fillColor);
        if (elementSize && typeof element.setSize === 'function') element.setSize(parseFloat(elementSize));
        if (labelColor && typeof element.setLabelColor === 'function') element.setLabelColor(labelColor);
        if (labelSize && typeof element.setLabelSize === 'function') element.setLabelSize(parseFloat(labelSize));
        if (nodeShape && typeof element.setShape === 'function') element.setShape(nodeShape);
      });
    }
  };

  const createMappingInputs = (mappingType, mappingValue, rangeMapping, rangeMappingSetter) => {
    if (mappingValue === 'edgeCount' && mappingType !== 'shape') {
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
          <Setting name="Fill Color">
            <ColorPicker color={fillColor} setColor={setFillColor}/>
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
            name="Fill Color"
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
            <ColorRangePicker indicators={labelColorMapIndicators} setIndicators={setLabelColorMapIndicators}/>
          </ExpandableSetting>
          <ExpandableSetting
            name="Label Size"
            mappingValue={labelSizeMappingValue}
            setMappingValue={setLabelSizeMappingValue}
            mappingOptions={Object.keys(nodeDataPoints)}
          >
            <RangeInput range={labelSizeMapping} setRange={setLabelSizeMapping}/>
          </ExpandableSetting>
        </div>
      )}
      <div className="controls">
        <Select
          options={['Nodes', 'Edges', 'Both']}
          value={elementType}
          setSelected={setElementType}
          opensUp
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
