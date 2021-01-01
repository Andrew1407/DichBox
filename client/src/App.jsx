import React from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import VerifiersContextProvider from './contexts/VerifiersContext';
import UserContextProvider from './contexts/UserContext';
import MenuContextProvider from './contexts/MenuContext';
import BoxesContextProvider from './contexts/BoxesContext';
import { BrowserRouter } from 'react-router-dom';
import ReactModal from 'react-modal';
import './styles/main.css';

ReactModal.setAppElement('#root')
const App = () => (
  <BrowserRouter>
    <div id="main">
      <MenuContextProvider>
      <UserContextProvider>
      <VerifiersContextProvider>
      <BoxesContextProvider>
        <Header />
        <MainContent />
        <Footer />
      </BoxesContextProvider>
      </VerifiersContextProvider>
      </UserContextProvider>
      </MenuContextProvider>
    </div>
  </BrowserRouter>
);


export default App;
