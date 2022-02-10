import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import MenuSwitch from '../../UI/MenuSwitch/MenuSwitch';
import ColorPicker from '../../UI/ColorPicker/ColorPicker';
import Button from '../../UI/Button/Button';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Select from '../../UI/Select/Select';
import SmallNumberInput from '../../UI/SmallTextInput/SmallNumberInput';

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

  const applyChanges = () => {
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
      <div className="settings">
        <div className="setting">
          <div className="label">Fill Color:</div>
          <div className="config">
            <ColorPicker color={fillColor} setColor={setFillColor}/>
            {fillColor && (
              <Button text="reset" className="reset" onClick={() => setFillColor(undefined)}/>
            )}
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
              className="shape-select"
            />
            {nodeShape && (
              <Button text="reset" className="reset" onClick={() => setNodeShape(undefined)}/>
            )}
          </div>
        </div>
        <div className="setting">
          <div className="label">Label Color:</div>
          <div className="config">
            <ColorPicker color={labelColor} setColor={setLabelColor}/>
            {labelColor && (
              <Button text="reset" className="reset" onClick={() => setLabelColor(undefined)}/>
            )}
          </div>
        </div>
        <div className="setting">
          <div className="label">Label Size:</div>
          <div className="config">
            <SmallNumberInput value={labelSize} setValue={setLabelSize}/>
            {labelSize && (
              <Button text="reset" className="reset" onClick={() => setLabelSize(undefined)}/>
            )}
          </div>
        </div>
      </div>
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
