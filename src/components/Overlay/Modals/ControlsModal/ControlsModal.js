import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Modal from '../Modal';
import {setShowControlsModal} from '../../../../redux/settings/settings.actions';

import './ControlsModal.scss';
import arrowKey from '../../../../assets/arrow-key.svg';

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
            <div className="key">W</div>
            <span>or</span>
            <div className="key"><img className="arrow-up" alt="arrow-up" src={arrowKey}/></div>
          </div>
          <div className="separator">-</div>
          <div className="function">Move Forward</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key">S</div>
            <span>or</span>
            <div className="key"><img className="arrow-down" alt="arrow-up" src={arrowKey}/></div>
          </div>
          <div className="separator">-</div>
          <div className="function">Move Backward</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key">A</div>
            <span>or</span>
            <div className="key"><img className="arrow-left" alt="arrow-up" src={arrowKey}/></div>
          </div>
          <div className="separator">-</div>
          <div className="function">Move Left</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key">D</div>
            <span>or</span>
            <div className="key"><img className="arrow-right" alt="arrow-up" src={arrowKey}/></div>
          </div>
          <div className="separator">-</div>
          <div className="function">Move Right</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key big">Space</div>
          </div>
          <div className="separator">-</div>
          <div className="function">Move Up</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key">C</div>
          </div>
          <div className="separator">-</div>
          <div className="function">Move Down</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key">F</div>
          </div>
          <div className="separator">-</div>
          <div className="function">Center view on selected Element</div>
        </div>
        <div className="rule">
          <div className="keys">
            <div className="key middle">Shift</div>
          </div>
          <div className="separator">-</div>
          <div className="function">Multiple Select</div>
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
          <div className="function">Select Element + all connected Elements</div>
        </div>
      </div>
    </Modal>
  );
};

export default ControlsModal;
