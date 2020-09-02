import React, { useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { BoxesContext } from '../../contexts/BoxesContext';
import { UserContext } from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';


const AddFile = ({ setAddFileVisible, addFileVisible, pathName, fileManipulation }) => {
  const { pathEntries, setPathEntries, boxDetails, setBoxDetails } = useContext(BoxesContext);
  const { username, userData } = useContext(UserContext);
  const { dispatchOpenedFiles } = useContext(MenuContext);
  const [nameInput, setNameInput] = useState('');
  const getInputWarningClb = () => {
    const inputValid = /^[^\s/]{1,40}$/;
    const nameExists = pathEntries
      .filter(x => x && x.name === nameInput)
      .length;
    if (!inputValid.test(nameInput))
      return 'Invalid input (name can\'t include slashes and spaces)';
    if (nameExists)
      return `An entry with the same name already exists in "/${pathName.join('/')}"`;
    return '';
  };
  const getInputWarning = useCallback(
    getInputWarningClb,
    [pathName, nameInput, pathEntries]
  );
  const warning = getInputWarning();
  const correctColor = !warning && nameInput ? 'rgb(0, 255, 76)' : 'rgb(0, 217, 255)';

  const addNewFileClb = async () => {
    const createBody = {
      fileName: nameInput,
      type: addFileVisible,
      follower: userData.follower,
      viewerName: username,
      boxPath: [boxDetails.owner_name, ...pathName],
      editor: userData.editor
    };
    const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/files/create`, createBody);
    const { created, last_edited } = data;
    if (!created) return;
    const { type, dir, file } = created;
    const isFile = type === 'file';
      setPathEntries(isFile ? file.src : dir.src);
    if (isFile)
      dispatchOpenedFiles({ 
        type: 'FILE_APPEND',
        file: {
          name: file.name,
          src: '',
          filePath: `/${userData.name}/${pathName.join('/')}`,
          opened: true
        }
      });
    setBoxDetails({ ...boxDetails, last_edited });
    setNameInput('');
    setAddFileVisible('');
  };
  const addNewFile = useCallback(addNewFileClb, [nameInput, addFileVisible]);

  useEffect(() => {
    if (fileManipulation || !addFileVisible)
      setNameInput('')
  }, [fileManipulation, addFileVisible]);

  return ( addFileVisible &&
    <div id="be-add-file">
      <label htmlFor="addFile">{addFileVisible} name:</label>
      <input spellCheck="false" type="text" name="addFile" value={ nameInput } onChange={ e => setNameInput(e.target.value) } />
      <input type="button" value="add" disabled={ warning || !nameInput } style={{ borderColor: correctColor, color: correctColor }} onClick={ addNewFile } />
      { warning && !!nameInput && <i id="be-add-file-warning">{ warning }</i> }
    </div>
  );
};

export default AddFile;
