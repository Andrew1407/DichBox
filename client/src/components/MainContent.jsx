import React from 'react';
import Menu from './Menu';
import ShowContent from './ShowContent';
import '../styles/main-content.css';

const MainContent = () => {
  return (
    <div id="main-content">
      <Menu />
      <ShowContent />
    </div>
  );
};

export default MainContent;
