import React, { useContext, useState, useCallback, useEffect } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import { VerifiersContext } from '../contexts/VerifiersContext';
import { UserContext } from '../contexts/UserContext';
import SignForms from './SignForms/SignForms';
import UserData from './UserData/UserData';
import hideImg from '../styles/imgs/hide-arrow.png';
import showImg from '../styles/imgs/show-arrow.png';
import homeLogo from '../styles/imgs/home-icon.png';
import '../styles/menu.css';

const Menu = () => {
  const { menuVisible, setMenuVisible, username, id, userData, pathName } = useContext(UserContext);
  const { dispatchDataInput, cleanWarnings } = useContext(VerifiersContext);
  const [menuOption, setMenuOption] = useState('createBox');
  const history = useHistory();
  const handleArrowClick = modifier => e => {
    e.preventDefault();
    setMenuVisible(modifier);
    dispatchDataInput({ type: 'CLEAN_DATA' });
    cleanWarnings();
  };
  const handleHomeClickClb = e => {
    e.preventDefault();
    const currentPath = history.location.pathname;
    const isMainPage = new RegExp(`/^${pathName}$/`);
    if (!isMainPage.test(currentPath))
      history.push('/' + pathName)
    setMenuOption('default')
    dispatchDataInput({ type: 'CLEAN_DATA' });
    cleanWarnings();
  };
  const handleHomeClick = useCallback(handleHomeClickClb, [userData, id, pathName]);

  // useEffect(() => {
  //   if (menuOption !== 'default')
  //     setMenuOption('default');
  // }, [pathName])

  return (
    menuVisible ? 
    ( <menu id="menu">
      <div id="menu-nav-btns">
        <img src={ hideImg } className="arrow" onClick={ handleArrowClick(false) } />
        <img src={ homeLogo } id="home-logo" onClick={ handleHomeClick } style={{ display: (menuOption !== 'default') && id ? 'block' : 'none' }} />
      </div>
        <Switch>
          <Route exact path="/">
            { username && userData ? <Redirect to={'/' + username} /> : <SignForms /> }
          </Route>
          <Route path="/:username">
            <UserData {...{ menuOption, setMenuOption }} />
          </Route>       
        </Switch>
    </menu> ) :
    <img src={showImg} className="arrow" id="show" onClick={ handleArrowClick(true) } />
  );
};

export default Menu;
