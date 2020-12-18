import React, { useState } from 'react';
import ReactModal from 'react-modal';
import ReactCrop from 'react-image-crop';
import { motion } from 'framer-motion';
import { buttonsMotion } from '../styles/motions/modal-buttons';
import 'react-image-crop/dist/ReactCrop.css';
import '../styles/crop-image.css';

const CropImage = ({ cropModalHidden, setCropModalHidden, setLogoEdited }) => {
  const [img, setImg] = useState(null);
  const [imgCropped, setImgCropped] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1 / 1 });
  const handleInputImage = e => {
    e.preventDefault();
    const [ file ] = e.target.files;
    setImg(URL.createObjectURL(file));
  };
  const handleCancel = () => {
    setCropModalHidden(true);
    setImg(null);
  };
  const applyCrop = () => {
    if (imgCropped) {
      getCroppped();
      setImg(null);
      setCropModalHidden(true);
    }
  };
  const getCroppped = () => {
    const canvas = document.createElement('canvas');
    const scaleX = imgCropped.naturalWidth / imgCropped.width;
    const scaleY = imgCropped.naturalHeight / imgCropped.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      imgCropped,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );
    const base64Image = canvas.toDataURL('image/png');
    setLogoEdited(base64Image);
  };
  
  return (
    <ReactModal isOpen={ !cropModalHidden } className="crop-modal" >
      <div id="crop-area">
        <ReactCrop {...{ src: img, crop, onChange: setCrop, onImageLoaded: setImgCropped }} />
      </div>
        <div className="crop-input-field">
          <p>file:</p>
          <input type="file" accept="image/*" onChange={ handleInputImage } />
        </div>

      <div id="crop-apply-btns">
        <motion.input
          { ...buttonsMotion }
          type="button" value="apply" onClick={ applyCrop }
        />
        <motion.input
          { ...buttonsMotion }
          type="button" value="cancel" onClick={ handleCancel }
        />
      </div>
    </ReactModal>
  );
};

export default CropImage;
