import React, { useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import { BoxesContext } from '../../contexts/BoxesContext';
import { MenuContext } from '../../contexts/MenuContext';
import '../../styles/file-manipulator.css';

const FileManipulator = ({ setFileManupulation, fileManipulation, addFileVisible, pathName }) => {
  const { username, userData } = useContext(UserContext);
  const { pathEntries, boxDetails, setBoxDetails, setPathEntries } = useContext(BoxesContext);
  const { dispatchOpenedFiles, openedFiles, searchFileInOpenedList } = useContext(MenuContext);
  const [renameInput, setRenameInput] = useState('');
  const [warning, setWarning] = useState('');
  const getFullPathStr = f =>
    `${f.type} "${f.name} (${pathName.join('/')}/${f.name})"`;
  const getWarningClb = input => {
    const inputValid = /^[^\s/]{1,40}$/;
    const nameExists = pathEntries
      .filter(x => x && x.name === input)
      .length;
    if (!inputValid.test(input))
      return 'Invalid input (name can\'t include slashes and spaces)';
    if (nameExists)
      return `An entry with the same name already exists in "/${pathName.join('/')}"`;
    return '';
  };
  const getWarning = useCallback(
    getWarningClb,
    [pathName, pathEntries]
  );
  const handleInput = e => {
    const input = e.target.value;
    const warning = getWarning(input);
    setWarning(warning);
    setRenameInput(input);
  }

  const handleRemoveClb = async () => {
    const rmBody = {
      fileName: fileManipulation.name,
      type: fileManipulation.type,
      follower: userData.follower,
      viewerName: username,
      boxPath: [boxDetails.owner_name, ...pathName],
      editor: userData.editor
    };
    const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/files/remove`, rmBody);
    const { removed, last_edited } = data;
    if (!removed) return;
    setPathEntries(pathEntries.filter(f => 
      f.name !== fileManipulation.name
    ));
    const filePath = fileManipulation.pathDepth.join('/');
    if (fileManipulation.type === 'dir') {
      const dirPath = filePath + '/' + fileManipulation.name;
      dispatchOpenedFiles({ type: 'FILES_CLOSE_BY_PATH', dirPath });
    } else {
      const { index } = searchFileInOpenedList(fileManipulation.name, '/' + filePath);
      setBoxDetails({ ...boxDetails, last_edited });
      dispatchOpenedFiles({ type: 'FILE_CLOSE', index });
    }
    setFileManupulation(null);
  };
  const handleRemove = useCallback(
    handleRemoveClb,
    [openedFiles, userData, boxDetails, pathEntries, fileManipulation]
  );

  const handleRenameClb = async () => {
    if (warning || !renameInput) return;
    const rnBody = {
      fileName: fileManipulation.name,
      follower: userData.follower,
      viewerName: username,
      boxPath: [boxDetails.owner_name, ...pathName],
      editor: userData.editor,
      newName: renameInput
    };
    const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/files/rename`, rnBody);
    const { last_edited, renamed } = data;
    if (!renamed) return;
    const filePath = '/' + fileManipulation.pathDepth.join('/');
    setPathEntries(pathEntries.map(f => 
      f.name === fileManipulation.name ?
        { ...f, name: renameInput } : f
    ));
    if (fileManipulation.type === 'dir') {
      const oldPath = filePath + '/' + fileManipulation.name;
      const newPath = filePath + '/' + renameInput;
      dispatchOpenedFiles({ type: 'FILES_RENAME_PATH', oldPath, newPath });
    } else {
      const { index } = searchFileInOpenedList(fileManipulation.name, filePath);
      dispatchOpenedFiles({ type: 'FILE_RENAME', index, name: renameInput });
    }
    setBoxDetails({ ...boxDetails, last_edited });
    setFileManupulation(null);
  };
  const handleRename = useCallback(
    handleRenameClb,
    [openedFiles, userData, boxDetails, pathEntries, fileManipulation, renameInput]
  );

  const correntInput = renameInput && !warning ?
    'rgb(0, 255, 76)' : 'rgb(0, 217, 255)';
  const OkBtnStyle = { 
    color: correntInput,
    borderColor: correntInput 
  };

  useEffect(() => {
    setRenameInput('');
    setWarning('');
  }, [addFileVisible, fileManipulation]);


  return ( fileManipulation &&
    <div className="menu-form" data-testid='file-manipulator-test'>
      <p id="fm-header">{ fileManipulation.action === 'rename' ? 'Rename' : 'Remove' } { getFullPathStr(fileManipulation) }?</p>
      { fileManipulation.action === 'rename' && 
        <div id="fm-rename">
          <input spellCheck="false" value={ renameInput } id="fm-rename" type="text" onChange={ handleInput }/>
          { warning && <i>{ warning }</i> }
        </div>
      }
      <div id="fm-btns">
        <input type="button" className="files-btn" value="ok" style={ fileManipulation.action === 'rename' ? OkBtnStyle : {} } onClick={ fileManipulation.action === 'rename' ? handleRename : handleRemove }/>
        <input type="button" className="files-btn" value="cancel" onClick={ () => setFileManupulation(null) } />
      </div>
    </div> 
  );
}

export default FileManipulator;
