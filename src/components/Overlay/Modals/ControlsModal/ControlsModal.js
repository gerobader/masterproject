import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Modal from '../Modal';
import KeyBinding from './KeyBinding/KeyBinding';
import {setShowControlsModal} from '../../../../redux/settings/settings.actions';

import './ControlsModal.scss';

const ControlsModal = () => {
  const {showControlsModal} = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  return (
    <Modal
      className="controls"
      show={showControlsModal}
      headline="Controls"
      closeFunction={() => dispatch(setShowControlsModal(false))}
    >
      <div className="title">Keyboard</div>
      <div className="control-bindings">
        <KeyBinding keys={[{code: 'F', class: 'key'}]} action="Center view on selected Elements"/>
        <KeyBinding keys={[{code: 'Esc', class: 'key'}]} action="Deselect all Elements"/>
        <KeyBinding keys={[{code: 'Ctrl', class: 'key middle'}]} action="(Hold) Multiple Select"/>
        <KeyBinding keys={[{code: 'Ctrl', class: 'key middle'}, {code: 'Z', class: 'key'}]} action="Undo Change"/>
        <KeyBinding
          keys={[{code: 'Ctrl', class: 'key middle'}, {code: 'Shift', class: 'key middle'}, {code: 'Z', class: 'key'}]}
          action="Redo Change"
        />
      </div>
      <div className="title">Mouse</div>
      <div className="control-rules">
        <KeyBinding keys={[{class: 'mouse left-click'}]} action="Rotate View / Select Elements"/>
        <KeyBinding keys={[{class: 'mouse middle-click'}]} action="Zoom / Select all connected Elements"/>
        <KeyBinding keys={[{class: 'mouse right-click'}]} action="Move View"/>
      </div>
    </Modal>
  );
};

export default ControlsModal;
