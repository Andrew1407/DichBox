import React, { useContext, useCallback } from 'react';
import { MainContext } from '../contexts/MainContext';
import { useHistory } from 'react-router-dom';
import defaultLogo from '../styles/imgs/default-user-logo.png';
import '../styles/header.css';

const Header = () => {
  const { menuVisible, setMenuVisible, username, id, setPathName, pathName } = useContext(MainContext);
  const history = useHistory();
  const handleMenuClickClb = e => {
    e.preventDefault();
    if (pathName === username) {
      setMenuVisible(!menuVisible);
    }
    else {
      setMenuVisible(true);
      setPathName(username)
      history.push('/');
    }
  };
  const handleMenuClick = useCallback(handleMenuClickClb, [username, menuVisible, pathName]);
  const backgroundColor = id ? 'rgb(50, 211, 240)' : 'grey';       //for image state

  return (
    <div id="header">
      <div id="header-name">
        <h1>DichBox</h1>
      </div>
      <div id="header-menu">
        <img src={defaultLogo}  onClick={ handleMenuClick } style={{ backgroundColor }} />
      </div>
      <div id="header-search">
        <input type="text" placeholder="search boxes" />
      </div>
    </div>
  )
};

export default Header;
