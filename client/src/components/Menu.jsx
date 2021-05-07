import React, { useContext, useCallback, useEffect } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { VerifiersContext } from '../contexts/VerifiersContext';
import { UserContext } from '../contexts/UserContext';
import { MenuContext } from '../contexts/MenuContext';
import { BoxesContext } from '../contexts/BoxesContext';
import { hideMenuMotion, showMenuMotion, bounceDownMotion } from '../styles/motions/switch-icons';
import { menuMotion } from '../styles/motions/menu-components';
import SignForms from './SignForms/SignForms';
import UserData from './UserData/UserData';
import SearchList from './SearchList';
import hideImg from '../styles/imgs/hide-arrow.png';
import showImg from '../styles/imgs/show-arrow.png';
import homeLogo from '../styles/imgs/home-icon.png';
import Errors from './Errors/Errors';
import Loading from './Loading';
import '../styles/menu.css';

const Menu = () => {
  const { username, userData, pathName } = useContext(UserContext);
  const { dispatchDataInput, cleanWarnings } = useContext(VerifiersContext);
  const {
    setBoxesList,
    setBoxDetails,
    setEditBoxState,
    setBoxHiddenState,
    setPathEntries
  } = useContext(BoxesContext);
  const {
    menuOption,
    setMenuOption,
    menuVisible,
    setMenuVisible,
    searchStr,
    setSearchStr,
    setUsersList,
    setFoundErr,
    foundErr,
    isLodaing
  } = useContext(MenuContext);
  const history = useHistory();
  const handleArrowClick = modifier => e => {
    e.preventDefault();
    setMenuVisible(modifier);
    dispatchDataInput({ type: 'CLEAN_DATA' });
    cleanWarnings();
  };
  const handleHomeClickClb = e => {
    e.preventDefault();
    if (menuOption !== 'boxes')
      setBoxesList([]);
    const currentPath = history.location.pathname;
    setMenuOption('default');
    dispatchDataInput({ type: 'CLEAN_DATA' });
    setEditBoxState(false);
    cleanWarnings();
    setBoxDetails({});
    setBoxHiddenState(false);
    setPathEntries([]);
    setUsersList(null);
    if (foundErr) setFoundErr(null);
    if (searchStr) setSearchStr('');
    if (`/${pathName}` !== currentPath)
      history.push(`/${pathName}`);
  };
  const handleHomeClick = useCallback(
    handleHomeClickClb,
    [userData, username, pathName, searchStr, foundErr]
  );
  const homeIconVisible = (menuOption !== 'default') && username || 
    history.location.pathname.split('/').length > 2 || searchStr;

  useEffect(() => {
    if (menuOption !== 'default')
      setMenuOption('default');
  }, [pathName]);

  return (
  <div id="menu" data-testid="menu-test"
    style={ menuVisible ?
      { 
        maxWidth: '30%',
        minWidth: '30%',
        borderTop: '2px solid rgb(75, 73, 73)',
        borderRight: '4px solid rgb(75, 73, 73)'
      } : {
        maxWidth: '30%'
      }
    }
  >
  <AnimatePresence>
  { menuVisible && 
    <motion.menu { ...menuMotion }>
      { foundErr ?
        <Errors /> :
        ( isLodaing ?
          <Loading /> :
          <div>
            <div id="menu-nav-btns">
              <motion.img
                { ...hideMenuMotion }
                src={ hideImg } className="arrow" onClick={ handleArrowClick(false) }
              />
              <motion.img
                { ...bounceDownMotion }
                src={ homeLogo } id="home-logo" onClick={ handleHomeClick } style={{ display: homeIconVisible ? 'block' : 'none' }}
              />
            </div>
            { searchStr ?
              <SearchList /> :
              <Switch>
                <Route exact path="/">
                  { username && userData ? <Redirect to={'/' + username} /> : <SignForms /> }
                </Route>
                <Route path="/:username">
                  <UserData />
                </Route>       
              </Switch>
            }
          </div>
        )
      }
    </motion.menu>
  }
  </AnimatePresence>
  { !menuVisible &&      
    <motion.img
      { ...showMenuMotion }
      src={ showImg } className="arrow" id="show" onClick={ handleArrowClick(true) }
    />
  }
  </div>
  );
};

export default Menu;
