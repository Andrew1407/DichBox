import React, { useContext, useEffect } from 'react';
import { MenuContext } from '../contexts/MenuContext';
import '../styles/show-content.css';


const ShowContent = () => {
  const { openedFiles } = useContext(MenuContext);
  useEffect(() => console.log(openedFiles), [openedFiles])
  
  return (
    <div id="show-content" >
      <h1>nothing to do there</h1>
    </div>
  );
};

export default ShowContent;
