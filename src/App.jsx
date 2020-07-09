import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Menu from './components/Menu';
import MainContent from './components/MainContent';
import './styles/main.css';

const App = () => (
  <div id="main-page">
    <Header />
    <Menu />
    <MainContent />
    <Footer />
  </div>
);


export default App;
