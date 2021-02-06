import React from 'react';
import ReactModal from 'react-modal';
import { motion } from 'framer-motion';
import { buttonsMotion } from '../styles/motions/modal-buttons';
import '../styles/confirm-modal.css';

const CofirmModal = ({ isOpen, okClb, message, setModalOptions, ariaShowApp }) => {
  return (
    <ReactModal {...{ isOpen, ariaHideApp: !ariaShowApp }} className="confirm-modal">
        <p data-testid="confirm-modal-title-test" id="confirm-message">¿ { message }  ؟</p>
        <div data-testid="confirm-modal-btns-test" id="confirm-btns">
          <motion.input 
            { ...buttonsMotion }
            type="button" value="ok" onClick={ okClb }
          />
          <motion.input
            { ...buttonsMotion }
            type="button" value="cancel" onClick={ () => setModalOptions(null) }
          />
        </div>
    </ReactModal>
  );
};

export default CofirmModal;
