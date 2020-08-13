import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

const BoxesList = ({ boxesList, listOption, searchInput, setMenuOption }) => {
  const history = useHistory();
  const { userData } = useContext(UserContext);

  let showBoxes = boxesList;
  if (!!searchInput || listOption !== 'all')
    showBoxes = showBoxes.filter(box => {
      const nameMatches = box.name.includes(searchInput);
      return listOption === 'all' ? 
        nameMatches :
        nameMatches && box.access_level === listOption;
    });

  return ( showBoxes.length ?
    <div id="boxes-list">
      {showBoxes.map(box => 
        <div key={ `${box.name}, ${box.access_level}` } onClick={ () => history.push(`/${box.owner_name}/${box.name}`) } >
          <p style={{ color: box.name_color }} >{box.name}</p>
        </div>  
      )}
    </div> :
    (!userData.ownPage && listOption === 'followers') ?
      <h1 id="boxes-list-empty">Follow
        <b style={{ color: userData.name_color }} onClick={ () => setMenuOption('default') } > {userData.name} </b>
        to see the boxes for followers
      </h1> :
      <h1 id="boxes-list-empty">No boxes there</h1>
  );
};

export default BoxesList;
