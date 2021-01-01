import React from 'react';
import ReactModal from 'react-modal';
import { motion } from 'framer-motion';
import { buttonsMotion } from '../styles/motions/modal-buttons';
import '../styles/confirm-modal.css';

const CofirmModal = ({ isOpen, okClb, message, setModalOptions }) => {
  return (
    <ReactModal {...{ isOpen }} className="confirm-modal">
        <p id="confirm-message">¿ { message }  ؟</p>
        <div id="confirm-btns">
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
