import React from 'react';
import '../styles/header.css';

const Header = () => (
  <div id="header">
    <div id="header-name">
      <h1>DichBox</h1>
    </div>
    <div id="header-search">
      <input type="text" placeholder="search boxes" />
    </div>
  </div>
);

export default Header;
