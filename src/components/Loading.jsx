import React from 'react';
import loadingGif from '../styles/imgs/loading.gif';
import '../styles/loading.css';

const Loading = () => {

  return (
    <div className="menu-form">
      <h1 id="loading-title">Loading...</h1>
      <img id="loading-img" src={ loadingGif }/>
      <span id="loading-desc">Please, stand by</span>
    </div>
  );
};

export default Loading;
