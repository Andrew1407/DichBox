import React, { useContext, useState, useCallback, useEffect } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { VerifiersContext } from '../contexts/VerifiersContext';
import { UserContext } from '../contexts/UserContext';
import { MenuContext } from '../contexts/MenuContext';
import { BoxesContext } from '../contexts/BoxesContext';
import SignForms from './SignForms/SignForms';
import UserData from './UserData/UserData';
import hideImg from '../styles/imgs/hide-arrow.png';
import showImg from '../styles/imgs/show-arrow.png';
import homeLogo from '../styles/imgs/home-icon.png';
import '../styles/menu.css';

const Menu = () => {
  const { username, userData, pathName } = useContext(UserContext);
  const { dispatchDataInput, cleanWarnings } = useContext(VerifiersContext);
  const { setBoxesList, setBoxDetails, setEditBoxState, setBoxHiddenState, setPathEntries } = useContext(BoxesContext);
  const { menuOption, setMenuOption, menuVisible, setMenuVisible } = useContext(MenuContext);
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
    if (`/${pathName}` !== currentPath)
      history.push('/' + pathName);
  };
  const handleHomeClick = useCallback(handleHomeClickClb, [userData, username, pathName]);
  const homeIconVisible = (menuOption !== 'default') && username || 
    history.location.pathname.split('/').length > 2;

  useEffect(() => {
    if (menuOption !== 'default')
      setMenuOption('default');
  }, [pathName]);

  return (
    menuVisible ? 
    ( <menu id="menu">
      <div id="menu-nav-btns">
        <img src={ hideImg } className="arrow" onClick={ handleArrowClick(false) } />
        <img src={ homeLogo } id="home-logo" onClick={ handleHomeClick } style={{ display: homeIconVisible ? 'block' : 'none' }} />
      </div>
        <Switch>
          <Route exact path="/">
            { username && userData ? <Redirect to={'/' + username} /> : <SignForms /> }
          </Route>
          <Route path="/:username">
            <UserData />
          </Route>       
        </Switch>
    </menu> ) :
    <img src={ showImg } className="arrow" id="show" onClick={ handleArrowClick(true) } />
  );
};

export default Menu;
