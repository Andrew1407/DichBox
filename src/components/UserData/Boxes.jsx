import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import BoxesList from './BoxesList';
import '../../styles/menu-boxes.css';

const Boxes = ({ menuOption, setMenuOption }) => {
  const { userData, id } = useContext(UserContext);
  const [boxesList, setBoxesList] = useState([]);
  const [listOption, setListOption] = useState('all');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (menuOption !== 'boxes')
      setMenuOption('boxes');
    const fetchBoxesList = async () => {
      if (!boxesList.length && userData.id) {
        const boxesBody = {
          viewerId: id,
          boxOwnerId: userData.id,
          follower: userData.follower
        };
        const { data } = await await axios.post('http://192.168.0.223:7041/boxes/user_boxes', boxesBody);
        if (data.boxesList)
          setBoxesList(data.boxesList);
      }
    };

    fetchBoxesList();
    return () => setBoxesList([]);
  }, [userData]);

  return (
    <div className="menu-form">
      <div id="boxes-header" className="menu-form">
        <h1 id="boxes-title">Boxes</h1>
        <div id="boxes-search">
          <div>
          </div>
            <label htmlFor="search">search:  </label>
            <input type="text" name="search" onChange={ e => setSearchInput(e.target.value) } />
          <select id="boxes-select" onChange={ e => setListOption(e.target.value) } >
            <option value="all">all</option>
            <option value="public">public</option>
            { userData.ownPage && <option value="private">private</option> }
            <option value="followers">followers</option>
            <option value="limited">limited</option>
            <option value="invetee">invetee</option>
          </select>
        </div>
        { userData.ownPage && <input id="boxes-header-btn" type="button" value="[ + new box ]" onClick={ () => setMenuOption('createBox') } /> }
      </div>
      <BoxesList {...{ boxesList, listOption, searchInput, setMenuOption }}/>
    </div>
  );
};

export default Boxes;
