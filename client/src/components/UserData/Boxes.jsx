import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { componentMotion } from '../../styles/motions/menu-components';
import { UserContext } from '../../contexts/UserContext';
import { BoxesContext } from '../../contexts/BoxesContext';
import { MenuContext } from '../../contexts/MenuContext';
import BoxesList from './BoxesList';
import '../../styles/menu-boxes.css';

const Boxes = () => {
  const { userData, username } = useContext(UserContext);
  const {
    menuOption,
    setMenuOption,
    setLoading,
    setFoundErr
  } = useContext(MenuContext);
  const {
    boxesList,
    setBoxesList,
    listOption,
    setListOption
  } = useContext(BoxesContext);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (menuOption !== 'boxes')
      setMenuOption('boxes');
    const fetchBoxesList = async () => {
      if (!boxesList.length && userData.name) {
        const boxesBody = {
          viewerName: username,
          boxOwnerName: userData.name
        };
        setLoading(true);
        try {
          const { data } = await axios.post(`${process.env.APP_ADDR}/boxes/user_boxes`, boxesBody);
          const { boxesList } = data;
          const boxes = boxesList && boxesList.length ? boxesList : [null]; 
          setBoxesList(boxes);
        } catch {
          const msg = 'It\'s a secret, but something terrible happened on the DichBox server...';
          setFoundErr(['server', msg]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBoxesList();
  }, [userData, boxesList]);

  return (
    <motion.div { ...componentMotion } data-testid="boxes-test" className="menu-form">
      <div id="boxes-header" className="menu-form">
        <h1 id="boxes-title">Boxes</h1>
        <div id="boxes-search">
          <label htmlFor="search">search:  </label>
          <input id="boxes-search-line" type="text" name="search" onChange={ e => setSearchInput(e.target.value) } />
          <select id="boxes-select" onChange={ e => setListOption(e.target.value) } defaultValue={ listOption } >
            <option value="all">all</option>
            <option value="public">public</option>
            { userData.ownPage && <option value="private">private</option> }
            <option value="followers">followers</option>
            <option value="limited">limited</option>
            { userData.ownPage && <option value="invetee">invetee</option> }        
          </select>
        </div>
        { userData.ownPage && <input id="boxes-header-btn" type="button" value="[ + new box ]" onClick={ () => (setBoxesList([]), setMenuOption('createBox')) } /> }
      </div>
      <BoxesList {...{ searchInput, setMenuOption }}/>
    </motion.div>
  );
};

export default Boxes;
