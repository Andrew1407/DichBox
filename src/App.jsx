import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import MainContextProvider from './contexts/MainContext';
import { BrowserRouter } from 'react-router-dom';
import ReactModal from 'react-modal';
import './styles/main.css';

ReactModal.setAppElement('#root')
const App = () => (
  <BrowserRouter>
    <div id="main">
      <MainContextProvider>
        <Header />
        <MainContent />
        <Footer />
      </MainContextProvider>
    </div>
  </BrowserRouter>
);


export default App;
