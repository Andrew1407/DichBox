import React, { useContext } from 'react';
import Sign from './SignForms/Sign';
import UserInfo from './UserInfo/UserInfo';
import { MenuContext } from '../contexts/MenuContext';
import Navbar from './Navbar';
import '../styles/menu.css';

const Menu = () => {
  const { menuIsHidden, userId } = useContext(MenuContext);
  const styles = {
    visible: { display: 'block', gridColumn: '1 / 2' },
    hidden: { display: 'none', gridColumn: '1 / 1' }
  };
  return (
  <div id="menu" style={menuIsHidden ? styles.hidden : styles.visible}>
    <Navbar />
    {/* { userId ? <UserInfo /> : < Sign />} */}
    <UserInfo />
  </div>
 );
};

export default Menu;
