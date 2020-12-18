import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuContext } from '../contexts/MenuContext';
import { itemMotion } from '../styles/motions/list-items';
import { componentMotion } from '../styles/motions/menu-components';
import logoDefault from '../styles/imgs/default-user-logo.png'
import '../styles/users-list.css';

const SearchList = () => {
  const {
    setSearchStr,
    usersList,
    setUsersList
  } = useContext(MenuContext);
  const history = useHistory();
  const shortenName = str => str.length < 20 ? str : `${str.slice(0, 19)}...`;
  const handlePersonClick = username => () => {
    history.push(`/${username}`);
    setSearchStr('');
    setUsersList(null);
  };

  return (
    <AnimatePresence>
    <motion.div { ...componentMotion } id="search-list" className="menu-form">
      <h1 id="search-list-header">Found users</h1>
      { usersList && usersList.filter(x => x).length ? 
        usersList.map(person => 
          <div className="search-list-display search-list-person" key={ person.name }>
            <div onClick={ handlePersonClick(person.name) } className="search-list-data search-list-display">
              <img src={ person.logo || logoDefault }/>
              <motion.span
                { ...itemMotion }
                style={{ color: person.name_color }}
              >{ shortenName(person.name) }</motion.span>
            </div>
          </div>
        ) :
        <h1 id="search-list-none">No users were found</h1>
      }
    </motion.div>
    </AnimatePresence>
  );
};

export default SearchList;
