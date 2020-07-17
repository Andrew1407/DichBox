import React, { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { MainContext } from '../contexts/MainContext';
import SignForms from './SignForms/SignForms';
import UserData from './UserData/UserData';
import hideImg from '../styles/imgs/hide-arrow.png';
import showImg from '../styles/imgs/show-arrow.png';
import '../styles/menu.css';

const Menu = () => {
  const { menuVisible, setMenuVisible, userData } = useContext(MainContext);
  const username = userData.name;
  const handleArrowClick = modifier => e => {
    e.preventDefault();
    setMenuVisible(modifier)
  };
  const signedUserCheckup = () => (
    username ? <Redirect to={'/' + username} /> : <SignForms />
  );

  return (
    menuVisible ? 
    ( <menu id="menu">
      <img src={hideImg} className="arrow" onClick={ handleArrowClick(false) } />
      <Switch>
        <Route exact path="/" component={ signedUserCheckup } />
        <Route path="/:username" component={ UserData }/>
      </Switch>
    </menu> ) :
    <img src={showImg} className="arrow" id="show" onClick={ handleArrowClick(true) } />
  );
};

export default Menu;
