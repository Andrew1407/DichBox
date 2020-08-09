import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import '../../styles/menu-boxes.css';

const Boxes = ({ menuOption, setMenuOption }) => {
  const [boxesList, setBoxesList] = useState(null);
  const { userData, id } = useContext(UserContext);
  useEffect(() => {
    if (menuOption !== 'boxes')
      setMenuOption('boxes');
    const fetchBoxesList = async () => {
      if (!boxesList && userData.id) {
        const boxesBody = {
          id,
          ownPage: id === userData.id,
          followed: userData.followed
        };
        const { data } = await await axios.post('http://192.168.0.223:7041/boxes/user_boxes', boxesBody);
        setBoxesList(data.boxesList);
      }
    };

    fetchBoxesList()
  }, []);

  return (
    <div id="menu-boxes">
      <div id="boxes-header">
        <h1 id="boxes-title">Boxes</h1>
        <div id="boxes-search">
          <div>
          </div>
            <label htmlFor="search">search:  </label>
            <input type="text" name="search"/>
          <select id="boxes-select">
            <option value="all">all</option>
            <option value="public">public</option>
            { userData.ownPage && <option value="private">private</option> }
            { (userData.ownPage || userData.follower) && <option value="followers">followers</option> }
            { userData.ownPage && <option value="invetee">invetee</option> }
          </select>
        </div>
        { userData.ownPage && <input id="boxes-header-btn" type="button" value="[ + new box ]" onClick={ () => setMenuOption('createBox') } /> }
      </div>

      <div id="boxes-list">
        { !boxesList && <h1 id="boxes-list-empty">No boxes created</h1> }
      </div>
    </div>
  );
};

export default Boxes;
