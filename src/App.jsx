import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import UserContextProvider from './contexts/UserContext';
import { BrowserRouter } from 'react-router-dom';
import ReactModal from 'react-modal';
import './styles/main.css';

ReactModal.setAppElement('#root')
const App = () => (
  <BrowserRouter>
    <div id="main">
      <UserContextProvider>
        <Header />
        <MainContent />
        <Footer />
      </UserContextProvider>
    </div>
  </BrowserRouter>
);


export default App;
