import React from 'react';
import '../styles/menu.css';

const Menu = () => {
 return (
  <div id="menu">
    <h2 onClick={e => console.log(localStorage)}>menu</h2>
  </div>
 )
};

export default Menu;
