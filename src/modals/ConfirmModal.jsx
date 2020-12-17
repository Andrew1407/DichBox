import React from 'react';
import ReactModal from 'react-modal';
import '../styles/confirm-modal.css';

const CofirmModal = ({ isOpen, okClb, message, setModalOptions }) => {
  return (
    <ReactModal {...{ isOpen }} className="confirm-modal">
        <p id="confirm-message">¿ { message }  ؟</p>
        <div id="confirm-btns">
          <input type="button" value="ok" onClick={ okClb } />
          <input type="button" value="cancel" onClick={ () => setModalOptions(null) } />
        </div>
    </ReactModal>
  );
};

export default CofirmModal;
