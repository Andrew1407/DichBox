import React from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import VerifiersContextProvider from './contexts/VerifiersContext';
import UserContextProvider from './contexts/UserContext';
import { BrowserRouter } from 'react-router-dom';
import ReactModal from 'react-modal';
import './styles/main.css';

ReactModal.setAppElement('#root')
const App = () => (
  <BrowserRouter>
    <div id="main">
      <UserContextProvider>
      <VerifiersContextProvider>
        <Header />
        <MainContent />
        <Footer />
      </VerifiersContextProvider>
      </UserContextProvider>
    </div>
  </BrowserRouter>
);


export default App;
