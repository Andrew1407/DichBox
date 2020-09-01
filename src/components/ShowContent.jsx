import React, { useContext } from 'react';
import FilesList from './FilesContent/FilesList';
import ShowArea from './FilesContent/ShowArea';
import '../styles/show-content.css';
import { MenuContext } from '../contexts/MenuContext';


const ShowContent = () => {
  const { openedFiles } = useContext(MenuContext)
    
  return ( !!openedFiles.length &&
    <div id="show-content" >
      <FilesList />
      <ShowArea />
    </div>
  );
};

export default ShowContent;
