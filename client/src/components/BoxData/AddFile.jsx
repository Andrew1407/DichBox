import React, { useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { boxToolMotion } from '../../styles/motions/menu-components';
import { BoxesContext } from '../../contexts/BoxesContext';
import { UserContext } from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';

const AddFile = ({ setAddFileVisible, addFileVisible, pathName, fileManipulation }) => {
  const { pathEntries, setPathEntries, boxDetails, setBoxDetails } = useContext(BoxesContext);
  const { username, userData } = useContext(UserContext);
  const { dispatchOpenedFiles } = useContext(MenuContext);
  const [nameInput, setNameInput] = useState('');
  const [imageInput, setImageInput] = useState(null);
  const [imageChosen, setImageChosen] = useState(false);
  const getInputWarningClb = fname => {
    if (!fname) return '';
    const inputValid = /^[^\s/]{1,40}$/;
    const nameExists = pathEntries
      .filter(x => x && x.name === fname)
      .length;
    if (!inputValid.test(fname))
      return 'Invalid input (name can\'t include slashes and spaces)';
    if (nameExists)
      return `An entry with the same name already exists in "/${pathName.join('/')}"`;
    return '';
  };
  const getInputWarning = useCallback(
    getInputWarningClb,
    [pathName, nameInput, pathEntries]
  );

  const warning = getInputWarning(
    addFileVisible === 'image' ?
      (imageInput && imageInput.name) :
      nameInput
  );
  const isCollorCorrect = (!warning && nameInput) ||
    (addFileVisible === 'image' && imageChosen && !warning);
  const correctColor = isCollorCorrect ? 'rgb(0, 255, 76)' : 'rgb(0, 217, 255)';

  const addNewFileClb = async () => {
    let createBody = {
      fileName: nameInput,
      type: addFileVisible,
      viewerName: username,
      boxPath: [boxDetails.owner_name, ...pathName]
    };
    createBody = addFileVisible === 'image' ?
      { ...createBody, fileName: imageInput.name, src: imageInput.src } :
      { ...createBody, fileName: nameInput };
    
    const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/files/create`, createBody);
    const { created, last_edited } = data;
    if (!created) return;
    const { type, dir, file } = created;
    const isFile = type === 'file' || type === 'image';
    setPathEntries(isFile ? file.src : dir.src);
    if (isFile)
      dispatchOpenedFiles({ 
        type: 'FILE_APPEND',
        file: {
          name: file.name,
          src: type === 'image' ? imageInput.src : '',
          filePath: `/${userData.name}/${pathName.join('/')}`,
          opened: true,
          type
        }
      });
    setBoxDetails({ ...boxDetails, last_edited });
    setNameInput('');
    setAddFileVisible('');
    setImageInput(null);
  };
  const addNewFile = useCallback(
    addNewFileClb,
    [nameInput, addFileVisible, imageInput]
  );

  const writeImageClb = e => {
    e.preventDefault();
    if (!imageChosen) setImageChosen(true);
    const image = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = () => setImageInput({
      name: image.name,
      src: reader.result
    });
  };
  const writeImage = useCallback(writeImageClb, [imageChosen]);

  useEffect(() => {
    if (fileManipulation || !addFileVisible) {
      setNameInput('');
      setImageInput(null);
      setImageChosen(false);
    } else if (addFileVisible !== 'image') {
      setImageChosen(false);
      setImageInput(null);
    } else if (addFileVisible === 'image') {
      setNameInput('');
    }

  }, [fileManipulation, addFileVisible]);

  return (
    <AnimatePresence>
    { addFileVisible &&
      ( addFileVisible === 'image' ?
        <motion.div { ...boxToolMotion } id="be-add-file" data-testid="add-img-test">
          <label htmlFor="addFile">Select image: </label>
          <input type="file" accept="image/*" onChange={ writeImage }/>
          <input className="files-btn" type="button" value="add" disabled={ !(isCollorCorrect && imageInput) } onClick={ addNewFile } style={{ borderColor: correctColor, color: correctColor }}/>
          { warning && imageInput && <i className="be-add-file-warning">{ warning }</i> }
        </motion.div> :
        <motion.div { ...boxToolMotion } id="be-add-file" data-testid="add-file-test">
          <label htmlFor="addFile">{ addFileVisible } name:</label>
          <input spellCheck="false" type="text" name="addFile" value={ nameInput } onChange={ e => setNameInput(e.target.value) } />
          <input className="files-btn" type="button" value="add" disabled={ warning || !nameInput } style={{ borderColor: correctColor, color: correctColor }} onClick={ addNewFile } />
          { warning && !!nameInput && <i className="be-add-file-warning">{ warning }</i> }
        </motion.div>
      )
    }
    </AnimatePresence>
  );
};

export default AddFile;
