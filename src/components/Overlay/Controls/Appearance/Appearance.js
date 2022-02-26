import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import MenuSwitch from '../../UI/MenuSwitch/MenuSwitch';
import ColorPicker from '../../UI/ColorPicker/ColorPicker';
import Button from '../../UI/Button/Button';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Select from '../../UI/Select/Select';
import SmallNumberInput from '../../UI/SmallTextInput/SmallNumberInput';
import ColorRangePicker from '../../UI/ColorRangePicker/ColorRangePicker';
import {calculateColorForElement, sortElements} from '../../../utility';
import RangeInput from '../../UI/RangeInput/RangeInput';
import Setting from './Setting/Setting';
import ExpandableSetting from './ExpandableSetting/ExpandableSetting';

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
  const [fillMappingValue, setFillMappingValue] = useState();
  const [colorMapIndicators, setColorMapIndicators] = useState([]);
  const [sizeMappingValue, setSizeMappingValue] = useState();
  const [elementSizeMapping, setElementSizeMapping] = useState([]);

  const applyColorMapping = () => {
    if (fillMappingValue === 'Edge Count') {
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
        if (color && typeof element.object.setColor === 'function') {
          element.object.setColor(color);
        }
      });
    }
  };

  const applyElementSizeMapping = () => {
    if (sizeMappingValue === 'Edge Count') {
      const sortedElements = sortElements(applyOnlyToSelected ? selectedNodes : nodes);
      sortedElements.forEach((element) => {
        const size = elementSizeMapping[0] + ((elementSizeMapping[1] - elementSizeMapping[0]) * (element.percentage / 100));
        element.object.setSize(size);
      });
    }
  };

  const applyChanges = () => {
    if (colorMapIndicators.length) applyColorMapping();
    if (elementSizeMapping.length === 2 && !elementSizeMapping.includes(NaN)) applyElementSizeMapping();
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
      if (labelSize && typeof element.setLabelSize === 'function') element.setLabelSize(labelSize);
      if (nodeShape && typeof element.setShape === 'function') element.setShape(nodeShape);
    });
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
            {elementSize && (
              <Button text="reset" className="reset" onClick={() => setElementSize(undefined)}/>
            )}
          </Setting>
          <Setting name="Node Shape">
            <Select options={shapes} value={nodeShape} setSelected={setNodeShape} className="no-margin"/>
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
          <ExpandableSetting name="Fill Color">
            {(parentOpenState) => (
              <>
                <Setting name="Mapping Value">
                  <Select
                    options={['Edge Count']}
                    value={fillMappingValue}
                    setSelected={setFillMappingValue}
                    parentOpenState={parentOpenState}
                    className="fixed-when-open"
                  />
                  {fillMappingValue && (
                    <Button text="reset" className="reset" onClick={() => setFillMappingValue(undefined)}/>
                  )}
                </Setting>
                <Setting name="Range">
                  <ColorRangePicker indicators={colorMapIndicators} setIndicators={setColorMapIndicators}/>
                </Setting>
              </>
            )}
          </ExpandableSetting>
          <ExpandableSetting name="Element Size">
            {(parentOpenState) => (
              <>
                <Setting name="Mapping Value">
                  <Select
                    options={['Edge Count']}
                    value={sizeMappingValue}
                    setSelected={setSizeMappingValue}
                    parentOpenState={parentOpenState}
                    className="fixed-when-open"
                  />
                  {sizeMappingValue && (
                    <Button text="reset" className="reset" onClick={() => setSizeMappingValue(undefined)}/>
                  )}
                </Setting>
                <Setting name="Range">
                  <RangeInput range={elementSizeMapping} setRange={setElementSizeMapping}/>
                </Setting>
              </>
            )}
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
