import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import { BoxesContext } from '../../contexts/BoxesContext';

const BoxesList = ({ searchInput, setMenuOption }) => {
  const history = useHistory();
  const { userData } = useContext(UserContext);
  const { setListOption, boxesList, listOption, setBoxesList } = useContext(BoxesContext);

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
      { showBoxes.map(box => 
        <div className="boxes-items" key={ `${box.name}, ${box.access_level}` } onClick={ () =>(setBoxesList([]), setListOption('all'), history.push(`/${box.owner_name}/${box.name}`)) } >
          <p>
            <span style={{ color: box.name_color }} >{ box.name }</span>
            <span className="item-access">({ box.access_level })</span>
          </p>
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
