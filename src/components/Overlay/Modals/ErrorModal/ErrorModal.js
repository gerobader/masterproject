import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Modal from '../Modal';
import Button from '../../UI/Button/Button';
import {setErrorMessage} from '../../../../redux/settings/settings.actions';

import './ErrorModal.scss';
import errorIcon from '../../../../assets/error-icon.png';

const ErrorModal = () => {
  const {errorMessage} = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  return (
    <Modal
      headline="Error!"
      className="error"
      show={Boolean(errorMessage)}
      closeFunction={() => dispatch(setErrorMessage(undefined))}
    >
      <div className="error-wrapper">
        <img alt="error" src={errorIcon}/>
        <p>{errorMessage}</p>
      </div>
      <div className="button-wrapper">
        <Button text="Close" onClick={() => dispatch(setErrorMessage(undefined))}/>
      </div>
    </Modal>
  );
};

export default ErrorModal;
