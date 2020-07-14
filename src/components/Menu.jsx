import React, { useContext } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { MainContext } from '../contexts/MainContext';
import SignForms from './SignForms/SignForms';
import UserData from './UserData/UserData';
import hideImg from '../styles/imgs/hide-arrow.png';
import '../styles/menu.css';
import SingForms from './SignForms/SignForms';

const Menu = () => {
  const { isHidden, setMenuHidden, userId, userData } = useContext(MainContext);
  const handleArrowClick = e => {
    e.preventDefault();
    setMenuHidden(true)
  };
  const signedUserPathRender = () => {
    return (
      userId ? <Redirect to={`/${userData.name}`} /> : <SignForms />
    )
  };
  const userPathRender = ({ match }) => (
    <UserData userData={userData} />
  );

  return (
    !isHidden && <menu id="menu">
      <img src={hideImg} id="hide-arrow" onClick={ handleArrowClick } />
      <Switch>
        <Route exact path="/" render={ signedUserPathRender } />
        <Route path="/:username" component={ userPathRender }/>
      </Switch>
    </menu>
  );
};

export default Menu;
