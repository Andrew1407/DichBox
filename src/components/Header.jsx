import React, { useContext, useCallback } from 'react';
import { MainContext } from '../contexts/MainContext';
import { useHistory } from 'react-router-dom';
import defaultLogo from '../styles/imgs/default-user-logo.png';
import '../styles/header.css';

const Header = () => {
  const { menuVisible, setMenuVisible, username, id, setPathName } = useContext(MainContext);
  const history = useHistory();
  const handleMenuClickClb = e => {
    e.preventDefault()
    const currentPath = history.location.pathname;
    const pathName = new RegExp(username ? `^/${username}$` : '^/$');
    if (pathName.test(currentPath)) {
      setMenuVisible(!menuVisible);
    }
    else {
      setMenuVisible(true);
      setPathName(username)
      history.push('/');
    }
  };
  const handleMenuClick = useCallback(handleMenuClickClb, [username, menuVisible]);
  const backgroundColor = id ? 'rgb(50, 211, 240)' : 'grey';       //for image state

  return (
    <div id="header">
      <div id="header-name">
        <h1 onClick={e => {e.preventDefault(); localStorage.setItem('username', 7890  )}} >DichBox</h1>
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
