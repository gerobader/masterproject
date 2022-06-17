import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Modal from '../Modal';
import {setShowControlsModal} from '../../../../redux/settings/settings.actions';

import './ControlsModal.scss';
// import arrowKey from '../../../../assets/arrow-key.svg';

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
      <div className="control-rules">
        <div className="rule">
          <div className="keys">
            <div className="key">F</div>
          </div>
          <div className="separator">-</div>
          <div className="function">Center view on selected Elements</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key">Esc</div>
          </div>
          <div className="separator">-</div>
          <div className="function">Deselect all Elements</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key middle">Ctrl</div>
          </div>
          <div className="separator">-</div>
          <div className="function">(Hold) Multiple Select</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key middle">Ctrl</div>
            <span>+</span>
            <div className="key">Z</div>
          </div>
          <div className="separator">-</div>
          <div className="function">Undo</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key middle">Ctrl</div>
            <span>+</span>
            <div className="key middle">Shift</div>
            <span>+</span>
            <div className="key">Z</div>
          </div>
          <div className="separator">-</div>
          <div className="function">Redo</div>
        </div>
      </div>
      <div className="title">Mouse</div>
      <div className="control-rules">
        <div className="rule">
          <div className="keys">
            <div className="mouse left-click"/>
          </div>
          <div className="separator">-</div>
          <div className="function">Rotate View / Select Elements</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="mouse middle-click"/>
          </div>
          <div className="separator">-</div>
          <div className="function">Zoom / Select all connected Elements</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="mouse right-click"/>
          </div>
          <div className="separator">-</div>
          <div className="function">Move View</div>
        </div>
      </div>
    </Modal>
  );
};

export default ControlsModal;
