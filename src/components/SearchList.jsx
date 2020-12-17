import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuContext } from '../contexts/MenuContext';
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
    <motion.div
      id="search-list" className="menu-form"
      initial={{ x: -800 }}
      animate={{ x: 0 }}
      exit={{ x: -800 }}
      transition={{ duration: 0.3, type: 'tween' }}
    >
      <h1 id="search-list-header">Found users</h1>
      { usersList && usersList.filter(x => x).length ? 
        usersList.map(person => 
          <div className="search-list-display search-list-person" key={ person.name }>
            <div onClick={ handlePersonClick(person.name) } className="search-list-data search-list-display">
              <img src={ person.logo || logoDefault }/>
              <span style={{ color: person.name_color }}>{ shortenName(person.name) }</span>
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
