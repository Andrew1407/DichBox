import React, { useContext, useState, useEffect, useCallback } from 'react';
import { MenuContext } from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import editLogo from '../../styles/imgs/file-edit.png';
import cancelEditLogo from '../../styles/imgs/file-edit-cancel.png';
import saveLogo from '../../styles/imgs/file-save.png';
import saveAllLogo from '../../styles/imgs/file-save-all.png';
import zoomInLogo from '../../styles/imgs/file-zoom-in.png';
import zoomOutLogo from '../../styles/imgs/file-zoom-out.png';
import downloadLogo from '../../styles/imgs/file-download.png';

const ShowArea = () => {
  const { openedFiles, dispatchOpenedFiles } = useContext(MenuContext);
  const { userData } = useContext(UserContext);
  const [visibleFile, setVisibleFile] = useState(null);
  const [fontSize, setFontSize] = useState(140);
  const [editMode, setEditMode] = useState(false);

  const handleDownloadClb = async () => {
    const { src, name } = visibleFile;
    const element = document.createElement('a');
    const file = new Blob([src], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = name;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    element.removeChild(element);
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
  };
  const handleTextInput = useCallback(
    handleTextInputClb,
    [openedFiles, visibleFile]
  );

  useEffect(() => {
    (() => {
      for (const file of openedFiles)
        if (file.opened)
          return setVisibleFile(file);
      return setVisibleFile(null);
    })();
  }, [openedFiles]);



  return ( visibleFile &&
    <div id="show-area">
      <div id="edit-menu">
        { userData.editor && (editMode ?
          <img title="Set view mode" src={ cancelEditLogo } onClick={ () => setEditMode(false) } /> :
          <img title="Set edit mode" src={ editLogo } onClick={ () => setEditMode(true) } />
        )}
        { userData.editor && <img title={`Save changes into "${visibleFile.name}"`} src={ saveLogo } /> }
        { userData.editor && <img title="Save changes into all opened files" src={ saveAllLogo } /> }
        <img title="Zoom in" src={ zoomInLogo } onClick={ handleZoom('in') }  />
        <img title="Zoom out" src={ zoomOutLogo } onClick={ handleZoom('out') } />
        <img title={ `Download "${visibleFile.name}"` } src={ downloadLogo } onClick={ handleDownload } />
      </div>
      <textarea {...{ onChange: handleTextInput, style: { fontSize: `${fontSize}%` }, disabled: !editMode, value: (visibleFile ? visibleFile.edited : '') }} ></textarea>
    </div>
  );
};

export default ShowArea;
