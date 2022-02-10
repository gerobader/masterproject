import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import MenuSwitch from '../../UI/MenuSwitch/MenuSwitch';
import ColorPicker from '../../UI/ColorPicker/ColorPicker';
import Button from '../../UI/Button/Button';
import Checkbox from '../../UI/Checkbox/Checkbox';
import Select from '../../UI/Select/Select';

import './Appearance.scss';

const Appearance = () => {
  const {
    nodes, selectedNodes, edges, selectedEdges
  } = useSelector((state) => state.networkElements);
  const [activeMenu, setActiveMenu] = useState('left');
  const [fillColor, setFillColor] = useState('#ff0000');
  const [labelColor, setLabelColor] = useState('#ffffff');
  const [applyOnlyToSelected, setApplyOnlyToSelected] = useState(false);
  const [elementType, setElementType] = useState('Nodes');

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
      if (typeof element.setColor === 'function') element.setColor(fillColor);
      if (typeof element.setLabelColor === 'function') element.setLabelColor(labelColor);
    });
  };

  return (
    <div className="appearance-controls">
      <MenuSwitch setActiveMenu={setActiveMenu} activeMenu={activeMenu}/>
      <div className="settings">
        <div className="option">
          <div className="label">Fill Color:</div>
          <div className="setting">
            <ColorPicker color={fillColor} setColor={setFillColor}/>
          </div>
        </div>
        <div className="option">
          <div className="label">Label Color:</div>
          <div className="setting">
            <ColorPicker color={labelColor} setColor={setLabelColor}/>
          </div>
        </div>
      </div>
      <div className="controls">
        <Select
          options={['Nodes', 'Edges', 'Both']}
          value={elementType}
          setSelected={setElementType}
        />
        <Checkbox
          name="use-only-selected"
          text="Only selected"
          checked={applyOnlyToSelected}
          setChecked={setApplyOnlyToSelected}
        />
        <Button text="Apply" onClick={applyChanges}/>
      </div>
    </div>
  );
};

export default Appearance;
