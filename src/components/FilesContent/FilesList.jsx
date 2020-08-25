import React, { useContext, useCallback } from 'react';
import { MenuContext } from '../../contexts/MenuContext';
import crossIcon from '../../styles/imgs/file-close.png';

const FilesList = () => {
  const { openedFiles, dispatchOpenedFiles } = useContext(MenuContext);

  const showFileClb = (isOpened, index) => () => {
    if (isOpened) return;
    dispatchOpenedFiles({ type: 'FILE_OPEN', index });
  }; 
  const showFile = useCallback(showFileClb, [openedFiles]);

  const closeFile = index => () =>
    dispatchOpenedFiles({ type: "FILE_CLOSE", index }); 


  return (
    <div id="files-list">{
      openedFiles.map((file, i) => 
        <div onClick={ showFile(file.opened, i) } id={ i ? '' : 'opened-first' } className="opened-file" key={ i } style={{ color: file.opened ? 'black': 'rgb(0, 217, 255)', backgroundColor: file.opened ? 'rgb(0, 217, 255)' : 'black' }} >
          <p className="opened-file-name">{ file.name }</p>
          <img className="opened-file-close" onClick={ closeFile(i) } src={ crossIcon } />
        </div>
      )
    }</div>
  );
};

export default FilesList;
