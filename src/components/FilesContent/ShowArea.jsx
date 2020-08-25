import React, { useContext, useState, useEffect } from 'react';
import { MenuContext } from '../../contexts/MenuContext'

const ShowArea = () => {
  const { openedFiles } = useContext(MenuContext);
  const [visibleFile, setVisibleFile] = useState(null);

  useEffect(() => {
    for (const file of openedFiles)
      if (file.opened) {
        setVisibleFile(file);
        break;
      }
  }, [openedFiles]);

  return (
    <div id="show-area">
      <textarea disabled={ true } value={visibleFile ? visibleFile.src : ''}></textarea>
    </div>
  );
};

export default ShowArea;
