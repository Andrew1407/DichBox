import React from 'react';
import FilesList from './FilesContent/FilesList';
import ShowArea from './FilesContent/ShowArea';
import '../styles/show-content.css';


const ShowContent = () => {
    
  return (
    <div id="show-content" >
      <FilesList />
      <ShowArea />
    </div>
  );
};

export default ShowContent;
