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
  const { dispatchDataInput } = useContext(VerifiersContext);
  const [menuOption, setMenuOption] = useState('boxes');
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
  
  useEffect(() => {
    const userDataIsFetched = Object.keys(userData).length;
    if (userDataIsFetched && menuOption === 'editProfile') {
      const editDefaultFields = {
        name: userData.name,
        email: userData.email,
        description: userData.description,
        name_color: userData.name_color,
        description_color: userData.description_color
      };
      const dataReducerAction = {
        type: 'SET_DATA',
        data: editDefaultFields
      };
      dispatchDataInput(dataReducerAction);
    }
  }, [menuOption]);

  useEffect(() => {
    if (menuOption !== 'default')
      setMenuOption('default');
  }, [pathName])

  return (
    menuVisible ? 
    ( <menu id="menu">
      <img src={ hideImg } className="arrow" onClick={ handleArrowClick(false) } />
      { (menuOption !== 'default') && id && <img src={homeLogo} id="home-logo" onClick={ handleHomeClick } /> }
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
