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

import './Appearance.scss';

const shapes = [
  'Box', 'Cone', 'Cylinder', 'Dodecahedron', 'Icosahedron', 'Octahedron', 'Sphere', 'Tetrahedron', 'Torus', 'Torus Knot'
];

const Appearance = () => {
  const {
    nodes, selectedNodes, edges, selectedEdges
  } = useSelector((state) => state.networkElements);
  const [activeMenu, setActiveMenu] = useState('right');
  const [fillColor, setFillColor] = useState();
  const [elementSize, setElementSize] = useState();
  const [labelColor, setLabelColor] = useState();
  const [labelSize, setLabelSize] = useState();
  const [applyOnlyToSelected, setApplyOnlyToSelected] = useState(false);
  const [elementType, setElementType] = useState('Nodes');
  const [nodeShape, setNodeShape] = useState();
  const [fillColorMappingExpanded, setFillColorMappingExpanded] = useState(true);
  const [fillMappingValue, setFillMappingValue] = useState();
  const [colorMapIndicators, setColorMapIndicators] = useState([]);

  const applyColorMap = () => {
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

  const applyChanges = () => {
    if (colorMapIndicators.length) applyColorMap();
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
          <div className="setting">
            <div className="label">Fill Color:</div>
            <div className="config">
              <ColorPicker color={fillColor} setColor={setFillColor}/>
              {fillColor && (<Button text="reset" className="reset" onClick={() => setFillColor(undefined)}/>)}
            </div>
          </div>
          <div className="setting">
            <div className="label">Element Size:</div>
            <div className="config">
              <SmallNumberInput value={elementSize} setValue={setElementSize}/>
              {elementSize && (
                <Button text="reset" className="reset" onClick={() => setElementSize(undefined)}/>
              )}
            </div>
          </div>
          <div className="setting">
            <div className="label">Node Shape:</div>
            <div className="config">
              <Select
                options={shapes}
                value={nodeShape}
                setSelected={setNodeShape}
                className="no-margin"
              />
              {nodeShape && (<Button text="reset" className="reset" onClick={() => setNodeShape(undefined)}/>)}
            </div>
          </div>
          <div className="setting">
            <div className="label">Label Color:</div>
            <div className="config">
              <ColorPicker color={labelColor} setColor={setLabelColor}/>
              {labelColor && (<Button text="reset" className="reset" onClick={() => setLabelColor(undefined)}/>)}
            </div>
          </div>
          <div className="setting">
            <div className="label">Label Size:</div>
            <div className="config">
              <SmallNumberInput value={labelSize} setValue={setLabelSize}/>
              {labelSize && (<Button text="reset" className="reset" onClick={() => setLabelSize(undefined)}/>)}
            </div>
          </div>
        </div>
      ) : (
        <div className="settings">
          <div className={`expandable-setting${fillColorMappingExpanded ? ' open' : ''}`}>
            <div className="expandable-label" onClick={() => setFillColorMappingExpanded(!fillColorMappingExpanded)}>
              Fill Color
              <div className="arrow"/>
            </div>
            <div className="setting-wrapper">
              <div className="setting">
                <div className="label">Mapping Value:</div>
                <div className="config">
                  <Select
                    options={['Edge Count']}
                    value={fillMappingValue}
                    setSelected={setFillMappingValue}
                    parentOpenState={fillColorMappingExpanded}
                    className="fixed-when-open"
                  />
                  {fillMappingValue && (
                    <Button text="reset" className="reset" onClick={() => setFillMappingValue(undefined)}/>
                  )}
                </div>
              </div>
              <div className="setting">
                <div className="label">Range:</div>
                <div className="config">
                  <ColorRangePicker indicators={colorMapIndicators} setIndicators={setColorMapIndicators}/>
                </div>
              </div>
            </div>
          </div>
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
