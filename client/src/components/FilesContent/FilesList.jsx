import React, { useContext } from 'react';
import { MenuContext } from '../../contexts/MenuContext';
import crossIcon from '../../styles/imgs/file-close.png';

const FilesList = () => {
  const { openedFiles, dispatchOpenedFiles } = useContext(MenuContext);

  const showFile = (isOpened, index) => () => {
    if (!isOpened)
      dispatchOpenedFiles({ type: 'FILE_OPEN', index });
  }; 

  const closeFile = index => () =>
    dispatchOpenedFiles({ type: 'FILE_CLOSE', index }); 

  return (
    <div id="files-list" data-testid="files-list-test">{
      openedFiles.map((file, i) => 
        <div title={`${file.filePath.slice(1)}/${file.name}`} onClick={ showFile(file.opened, i) } className="opened-file" key={ i } style={{ color: file.opened ? 'black': 'rgb(0, 217, 255)', backgroundColor: file.opened ? 'rgb(0, 217, 255)' : 'black' }} >
          <p className="opened-file-name">{ file.name }</p>
          <img className="opened-file-close" onClick={ closeFile(i) } src={ crossIcon } />
        </div>
      )
    }</div>
  );
};

export default FilesList;
