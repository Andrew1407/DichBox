import React, { useContext } from 'react';
import logo from '../styles/imgs/menu-drop-icon.png'
import { MenuContext } from '../contexts/MenuContext';
import '../styles/menu-drop.css';

const MenuDrop = () => {
  const { menuIsHidden, setMenuState, userId } = useContext(MenuContext);
  const backgroundColor = userId ? 'rgb(50, 211, 240)' : 'grey';
  const switchMenuState = e => {
    e.preventDefault();
    setMenuState(!menuIsHidden)
  }; 
  return (
    <img id="menu-drop" src={logo} onClick={switchMenuState} style={{ backgroundColor }} />
  )
};

export default MenuDrop;
