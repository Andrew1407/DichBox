import React, { useContext, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserContext } from '../../contexts/UserContext';
import { BoxesContext } from '../../contexts/BoxesContext';
import { MenuContext } from '../../contexts/MenuContext';
import { itemMotion } from  '../../styles/motions/list-items';

const BoxesList = ({ searchInput, setMenuOption }) => {
  const history = useHistory();
  const { userData } = useContext(UserContext);
  const { openedFiles, dispatchOpenedFiles } = useContext(MenuContext);
  const { setListOption, boxesList, listOption, setBoxesList } = useContext(BoxesContext);

  const handleBoxClickClb = box => () => {
    if (openedFiles.length) {
      const file = openedFiles[0];
      if (file) {
        const [ userName, filesBoxName ] = file.filePath
          .split('/')
          .slice(1, 3);
        if (userName !== userData.name || filesBoxName !== box.name)
          dispatchOpenedFiles({type: 'FILES_CLOSE_ALL' });
      }
    }
    setBoxesList([]);
    setListOption('all');
    history.push(`/${box.owner_name}/${box.name}`);
  };
  const handleBoxClick = useCallback(handleBoxClickClb, [openedFiles]);

  let showBoxes = boxesList.filter(x => x);
  if (!!searchInput || listOption !== 'all')
    showBoxes = showBoxes.filter(box => {
      const nameMatches = box.name.includes(searchInput);
      return listOption === 'all' ? 
        nameMatches :
        nameMatches && box.access_level === listOption;
    });

  return ( showBoxes.length ?
    <div id="boxes-list">
      { showBoxes.map(box => 
        <div className="boxes-items" key={ `${box.name}, ${box.access_level}` } onClick={ handleBoxClick(box) } >
          <motion.p { ...itemMotion }>
            <span style={{ color: box.name_color }} >{ box.name }</span>
            <span className="item-access">({ box.access_level })</span>
          </motion.p>
        </div>  
      )}
    </div> :
    (!userData.ownPage && listOption === 'followers') ?
      <h1 id="boxes-list-empty">Follow
        <b style={{ color: userData.name_color }} onClick={ () => setMenuOption('default') }> { userData.name } </b>
        to see the boxes for followers
      </h1> :
      <h1 id="boxes-list-empty">No boxes there</h1>
  );
};

export default BoxesList;
