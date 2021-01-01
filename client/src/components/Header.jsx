import React, { useContext, useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { MenuContext } from '../contexts/MenuContext';
import { BoxesContext } from '../contexts/BoxesContext';
import { VerifiersContext } from '../contexts/VerifiersContext';
import { bouncingMotion, searchIconMotion } from '../styles/motions/bouncing-icons'
import { bounceDownMotion } from '../styles/motions/switch-icons';
import { headerMotion } from '../styles/motions/menu-components';
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
    const inputValid = /\S+/.test(searchInput);
    if (!inputValid || foundErr) return;
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
    if (foundErr) return;
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
        <motion.div { ...headerMotion } id="header">
          <div  onClick={ () => setHidden(true) } id="header-name" className="highlight">
            <h1>DichBox</h1>
          </div>
          <motion.div { ...bouncingMotion } id="header-menu">
            <img src={ defaultLogo } className="highlight" onClick={ handleMenuClick } style={{ backgroundColor }} /> 
          </motion.div>
          <form id="header-search" className="highlight" onSubmit={ e => (e.preventDefault(), handleSearchClick()) }>
            <input value={ searchInput } type="text" placeholder="search users" onChange={ handleSearchInput } />
            <motion.img
              { ...searchIconMotion }
              src={ searchLogo } onClick={ handleSearchClick }
            />
          </form>
        </motion.div>
      }
      </AnimatePresence>
      { hidden &&
        <motion.img
          { ...bounceDownMotion }
          id="header-hidden" src={ showArrow } onClick={ () => setHidden(false) }
        />
      }
    </div>
  );
};

export default Header;
