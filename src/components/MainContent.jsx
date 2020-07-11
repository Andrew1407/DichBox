import React, { useContext } from 'react';
import { MenuContext } from '../contexts/MenuContext';
import '../styles/main-content.css';

const MainContent = () => {
  const { menuIsHidden } = useContext(MenuContext);
  const gridColumn = menuIsHidden ? '1 / 5': '2 / 5';
  return (
  <div id="center" style={{ gridColumn }}>
    <h2>nothing to do there</h2>
  </div>
  )
};

export default MainContent;
