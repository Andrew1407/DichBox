import React, { useContext } from 'react';
import { MainContext } from '../contexts/MainContext'
import defaultLogo from '../styles/imgs/default-user-logo.png';
import '../styles/header.css';

const Header = () => {
  const { isHidden, setMenuHidden, userId } = useContext(MainContext);
  const handleMenuClick = e => {
    e.preventDefault();
    setMenuHidden(!isHidden)
  };
  const backgroundColor = userId ? 'rgb(50, 211, 240)' : 'grey';       //for image state

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
