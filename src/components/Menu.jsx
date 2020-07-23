import React, { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { MainContext } from '../contexts/MainContext';
import VerifiersContextProvider from '../contexts/VerifiersContext';
import SignForms from './SignForms/SignForms';
import UserData from './UserData/UserData';
import hideImg from '../styles/imgs/hide-arrow.png';
import showImg from '../styles/imgs/show-arrow.png';
import '../styles/menu.css';

const Menu = () => {
  const { menuVisible, setMenuVisible, username } = useContext(MainContext);
  const signedUserCheckup = () => (
    username ? <Redirect to={'/' + username} /> : <SignForms />
  );
  const handleArrowClick = modifier => e => {
    e.preventDefault();
    setMenuVisible(modifier)
  };

  return (
    menuVisible ? 
    ( <menu id="menu">
      <img src={ hideImg } className="arrow" onClick={ handleArrowClick(false) } />
      <VerifiersContextProvider>
        <Switch>
          <Route exact path="/" component={ signedUserCheckup } />
          <Route path="/:username" component={ UserData } />
        </Switch>
      </VerifiersContextProvider>
    </menu> ) :
    <img src={showImg} className="arrow" id="show" onClick={ handleArrowClick(true) } />
  );
};

export default Menu;
