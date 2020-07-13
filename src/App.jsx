import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import MainContextProvider from './contexts/MainContext';
import './styles/main.css';


const App = () => (
  <div id="main">
    <MainContextProvider>
      <Header />
      <MainContent />
      <Footer />
    </MainContextProvider>
  </div>
);


export default App;
