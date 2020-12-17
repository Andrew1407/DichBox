import React, { useContext, useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { MenuContext } from '../contexts/MenuContext';
import { BoxesContext } from '../contexts/BoxesContext';
import { VerifiersContext } from '../contexts/VerifiersContext';
import defaultLogo from '../styles/imgs/default-user-logo.png';
import searchLogo from '../styles/imgs/search.png';
import showArrow from '../styles/imgs/menu-show.png';
import '../styles/header.css';

const Header = () => {
  const history = useHistory();
  const {
    username,
    setPathName,
    pathName,
    dispatchUserData
  } = useContext(UserContext);
  const {
    menuVisible,
    setMenuVisible,
    setSearchStr,
    searchStr,
    setUsersList,
    setFoundErr,
    foundErr,
    setLoading
  } = useContext(MenuContext);
  const { dispatchDataInput, cleanWarnings } = useContext(VerifiersContext);
  const { setBoxesList, setBoxHiddenState, setBoxDetails } = useContext(BoxesContext);
  const [searchInput, setSearchInput] = useState('');
  const [hidden, setHidden] = useState(false);

  const handleSearchClick = async () => {
    if (!searchInput) return;
    if (foundErr) setFoundErr(null);
    setSearchStr(searchInput);
    const searchBody = { searchStr: searchInput };
    setLoading(true);
    const { data } = await axios.post(`${process.env.APP_ADDR}/users/search`, searchBody);
    setLoading(false);
    const { searched } = data;
    if (searched) setUsersList(searched);
  };

  const handleSearchInput = e => {
    e.preventDefault();
    const input = e.target.value;
    setSearchInput(input);
  };

  const handleMenuClickClb = () => {
    const currentUsername = username || '';
    const currentPathName = pathName || '';
    if (foundErr) setFoundErr(null);
    if (searchInput) setSearchInput('');
    if (searchStr) {
      setUsersList(null);
      setSearchStr('');
      return;
    }
    if (currentPathName === currentUsername) {
      setMenuVisible(!menuVisible);
    } else {
      setMenuVisible(true);
      setPathName(username);
      dispatchUserData({ type: 'CLEAN_DATA' });
      setBoxDetails({});
      setBoxesList([]);
      setBoxHiddenState(false);
      history.push('/');
    }
    dispatchDataInput({ type: 'CLEAN_DATA' });
    cleanWarnings();
  };
  const handleMenuClick = useCallback(
    handleMenuClickClb,
    [username, menuVisible, pathName, searchStr, searchInput, foundErr]
  );
  
  const backgroundColor = username ? 'rgb(50, 211, 240)' : 'grey';       //for image state

  useEffect(() => {
    if (searchStr && searchInput)
      handleSearchClick();
    else if (!searchInput)
      setSearchStr(null);
  }, [searchInput]);

  return (
    <div>
      <AnimatePresence>
      { !hidden && 
        <motion.div
          initial={{ y: -150 }}
          animate={{ y: 0 }}
          exit={{ y: -150 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          id="header"
        >
          <div id="header-name">
            <h1 onClick={ () => setHidden(true) }>DichBox</h1>
          </div>
          <div id="header-menu">
            <img src={ defaultLogo } onClick={ handleMenuClick } style={{ backgroundColor }} /> 
          </div>
          <form id="header-search" onSubmit={ e => (e.preventDefault(), handleSearchClick()) }>
            <input value={ searchInput } type="text" placeholder="search users" onChange={ handleSearchInput } />
            <motion.img
              whileHover={{
                y: [0, -10, 0, -8, 0, -6, 0, -3, 0],
                x: [0, -3, 0, -3, 0, -3, 0, -1, 0]
              }}
              transition={{ duration: 1.1 }}
              style={{ skewX: 25 }}
              src={ searchLogo } onClick={ handleSearchClick }
            />
          </form>
        </motion.div>
      }
      </AnimatePresence>
      { hidden &&
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          id="header-hidden" src={ showArrow } onClick={ () => setHidden(false) }
        />
      }
    </div>
  );
};

export default Header;
