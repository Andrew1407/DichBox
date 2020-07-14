import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import MainContextProvider from './contexts/MainContext';
import { BrowserRouter } from 'react-router-dom';
import './styles/main.css';


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
