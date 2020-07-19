import React, { useContext } from 'react';
import { MainContext } from '../contexts/MainContext';
import { useHistory } from 'react-router-dom';
import defaultLogo from '../styles/imgs/default-user-logo.png';
import '../styles/header.css';

const Header = () => {
  const { menuVisible, setMenuVisible, userData } = useContext(MainContext);
  const { id, name } = userData;
  const history = useHistory();
  const handleMenuClick = e => {
    const currentPath = history.location.pathname;
    const isHomePath = new RegExp(`^/(${name})?$`);
    if (isHomePath.test(currentPath)) {
      e.preventDefault()
      setMenuVisible(!menuVisible);
    }
    else {
      setMenuVisible(true);
      history.push('/');
    }
  };
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
