import React, { useContext, useState, useCallback } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { MainContext } from '../contexts/MainContext';
import VerifiersContextProvider from '../contexts/VerifiersContext';
import SignForms from './SignForms/SignForms';
import UserData from './UserData/UserData';
import hideImg from '../styles/imgs/hide-arrow.png';
import showImg from '../styles/imgs/show-arrow.png';
import homeLogo from '../styles/imgs/home-icon.png';
import '../styles/menu.css';

const Menu = () => {
  const { menuVisible, setMenuVisible, username, id, userData, pathName } = useContext(MainContext);
  const [menuOption, setMenuOption] = useState('default');
  const history = useHistory();
  const handleArrowClick = modifier => e => {
    e.preventDefault();
    setMenuVisible(modifier)
  };
  const handleHomeClickClb = e => {
    e.preventDefault();
    const currentPath = history.location.pathname;
    const isMainPage = new RegExp(`/^${pathName}$/`);
    if (!isMainPage.test(currentPath))
      history.push('/' + pathName)
    setMenuOption('default')
  };
  const handleHomeClick = useCallback(handleHomeClickClb, [userData, id, pathName]);

  return (
    menuVisible ? 
    ( <menu id="menu">
      <img src={ hideImg } className="arrow" onClick={ handleArrowClick(false) } />
      { (menuOption !== 'default') && id && <img src={homeLogo} id="home-logo" onClick={ handleHomeClick } /> }
      <VerifiersContextProvider>
        <Switch>
          <Route exact path="/">
            { username && userData ? <Redirect to={'/' + username} /> : <SignForms /> }
          </Route>
          <Route path="/:username">
            <UserData {...{ menuOption, setMenuOption }} />
          </Route>       
        </Switch>
      </VerifiersContextProvider>
    </menu> ) :
    <img src={showImg} className="arrow" id="show" onClick={ handleArrowClick(true) } />
  );
};

export default Menu;
