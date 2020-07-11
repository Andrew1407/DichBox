import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Menu from './components/Menu';
import MainContent from './components/MainContent';
import MenuDrop from './components/MenuDrop';
import MenuContextProvider from './contexts/MenuContext';
import './styles/main.css';

const App = () => (
  <div>
    <MenuContextProvider>
      <div id="main-page">
        <Header />
        <Menu />
        <MainContent />
        <Footer />
      </div>
      <MenuDrop />  
    </MenuContextProvider>
  </div>
);


export default App;
