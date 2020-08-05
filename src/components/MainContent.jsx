import React from 'react';
import Menu from './Menu';
import VerifiersContextProvider from '../contexts/VerifiersContext';
import ShowContent from './ShowContent';
import '../styles/main-content.css';

const MainContent = () => {
  return (
    <div id="main-content">
      <VerifiersContextProvider>
        <Menu />
      </VerifiersContextProvider>
      <ShowContent />
    </div>
  );
};

export default MainContent;
