import React from 'react';
import MenuElement from '../MenuElement/MenuElement';

import './Modal.scss';

const Modal = ({
  className, show, headline, closeFunction, children
}) => {
  return (
    <div className={`modal ${className}${show ? ' show' : ''}`}>
      <div className="background-overlay"/>
      <MenuElement headline={headline} simpleHeader>
        <div className="close-button" onClick={closeFunction}/>
        {children}
      </MenuElement>
    </div>
  );
};

export default Modal;
