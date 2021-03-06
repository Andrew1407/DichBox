import React, { useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MenuContext } from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import { BoxesContext } from '../../contexts/BoxesContext';
import { bouncingMotion } from '../../styles/motions/bouncing-icons';
import editLogo from '../../styles/imgs/file-edit.png';
import cancelEditLogo from '../../styles/imgs/file-edit-cancel.png';
import saveLogo from '../../styles/imgs/file-save.png';
import saveAllLogo from '../../styles/imgs/file-save-all.png';
import zoomInLogo from '../../styles/imgs/file-zoom-in.png';
import zoomOutLogo from '../../styles/imgs/file-zoom-out.png';
import downloadLogo from '../../styles/imgs/file-download.png';

const ShowArea = () => {
  const { openedFiles, dispatchOpenedFiles } = useContext(MenuContext);
  const { userData, username } = useContext(UserContext);
  const { boxDetails, setBoxDetails } = useContext(BoxesContext);
  const [visibleFile, setVisibleFile] = useState(null);
  const [fontSize, setFontSize] = useState(140);
  const [editMode, setEditMode] = useState(false);

  const handleDownloadClb = async () => {
    const { src, name } = visibleFile;
    const element = document.createElement('a');
    const file = new Blob([src], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = name;
    element.style.display = 'none';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.removeChild(element);
  };
  const handleDownload = useCallback(handleDownloadClb, [visibleFile]);

  const handleZoomClb = zoomType => () => {
    const zoom = zoomType === 'in' ? 10 : -10;
    const newSize = fontSize + zoom;
    if (newSize < 300 && newSize > 100)
      setFontSize(fontSize + zoom);
  };
  const handleZoom = useCallback(handleZoomClb, [fontSize]);

  const handleTextInputClb = e => {
    const edited = e.target.value;
    const { filePath, name } = visibleFile;
    const file = { filePath, name, edited };
    dispatchOpenedFiles({ type: 'FILE_EDIT', file });
    setVisibleFile({ visibleFile, edited });
  };
  const handleTextInput = useCallback(
    handleTextInputClb,
    [openedFiles, visibleFile]
  );

  const handleCancelEditClb = () => {
    const cancelledCopy = { ...visibleFile };
    delete cancelledCopy.edited;
    setVisibleFile(cancelledCopy);
    dispatchOpenedFiles({ type: 'FILES_CANCEL_EDITED' });
  };
  const handleCancelEdit = useCallback(
    handleCancelEditClb,
    [visibleFile, openedFiles]
  );

  const handleFileSaveClb = async () => {
    const cancelled = !editMode ||
      visibleFile.edited === undefined ||
      visibleFile.src === visibleFile.edited;
    if (cancelled) return;
    const { filePath, name, edited } = visibleFile; 
    const saveBody = {
      files: [{
        src: edited,
        filePathStr: `${filePath}/${name}`
      }],
      editorName: username
    };
    const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/files/save`, saveBody );
    const { last_edited } = data;
    if (!data.edited) return;
    setBoxDetails({ ...boxDetails, last_edited });
    const file = { ...visibleFile };
    delete file.edited;
    file.src = edited;
    setVisibleFile(file);
    dispatchOpenedFiles({ type: 'FILE_WRITE', file });
  };
  const handleFileSave = useCallback(
    handleFileSaveClb,
    [username, userData, visibleFile, openedFiles, editMode]
  );

  const handleFilesSaveAll = async () => {
    if (!editMode) return;
    const editedFiles = openedFiles.reduce((arr, f) => (
      (f && f.edited === f.src || f.edited === undefined) ? 
        arr : [ ...arr, { filePathStr: `${f.filePath}/${f.name}`, src: f.edited } ]
    ), []);
    if (!editedFiles.length) return;
    const saveBody = {
      files: editedFiles,
      editorName: username
    };
    const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/files/save`, saveBody );
    const { edited, last_edited } = data;
    if (!edited) return;
    setBoxDetails({ ...boxDetails, last_edited });
    const files = openedFiles.map(file => {
      const fileCopy = { ...file };
      if (file.edited !== undefined)
        fileCopy.src = file.edited;
      delete fileCopy.edited;
      return fileCopy;
    });
    const [ visibleCopy ] = files.filter(f => 
      f.name === visibleFile.name &&
      f.filePath === visibleFile.filePath
    );
    if (visibleCopy) setVisibleFile(visibleCopy);
    dispatchOpenedFiles({ type: 'FILES_WRITE_ALL', files });
  }

  useEffect(() => {
    const showFile = () => {
      if (!openedFiles.length)
        return setVisibleFile(null);
      const getFullPath = f => `${f.filePath}/${f.name}`;
      for (const file of openedFiles)
        if (file.opened)
          if (visibleFile) {    
            if (getFullPath(visibleFile) !== getFullPath(file))            
              return setVisibleFile(file);
          } else {
            return setVisibleFile(file);
          }
    };

    showFile();
  }, [openedFiles]);

  return ( visibleFile &&
    <div id="show-area" data-testid="show-area-test">
      <div id="edit-menu" style={ visibleFile.type === 'image' ? { width: '10%', marginLeft: '88%' }: {} }>
        { visibleFile.type !== 'image' && userData.editor && (editMode ?
          <motion.img
            { ...bouncingMotion }
            title="Set view mode" src={ cancelEditLogo } onClick={ () => (handleCancelEdit(), setEditMode(false)) }
          /> :
          <motion.img
            { ...bouncingMotion }
            title="Set edit mode" src={ editLogo } onClick={ () => setEditMode(true) }
          />
        )}
        { visibleFile.type !== 'image' && userData.editor && <motion.img
          { ...bouncingMotion }
          onClick={ handleFileSave } title={`Save changes into "${visibleFile.name}"`} src={ saveLogo }
        /> }
        { visibleFile.type !== 'image' && userData.editor && <motion.img
          { ...bouncingMotion }
          onClick={ handleFilesSaveAll } title="Save changes into all opened files" src={ saveAllLogo }
        /> }
        <motion.img
          { ...bouncingMotion }
          title="Zoom in" src={ zoomInLogo } onClick={ handleZoom('in') }
        />
        <motion.img
          { ...bouncingMotion }
          title="Zoom out" src={ zoomOutLogo } onClick={ handleZoom('out') }
        />
        { visibleFile.type !== 'image' && <motion.img
          { ...bouncingMotion }
          title={ `Download "${visibleFile.name}"` } src={ downloadLogo } onClick={ handleDownload }
        /> }
      </div>
      { visibleFile.type === 'image' ?
        <div id="show-image">
          <img src={ visibleFile.src } style={{ width: `${fontSize}%` }} />
        </div> :
        <textarea {...{ spellCheck: false, onChange: handleTextInput, style: { fontSize: `${fontSize}%` }, disabled: !editMode, value: (visibleFile ? (typeof visibleFile.edited === 'string') ? visibleFile.edited : visibleFile.src : '') }}></textarea>
      }
    </div>
  );
};

export default ShowArea;
