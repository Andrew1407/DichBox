import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { componentMotion } from '../styles/motions/menu-components';
import loadingGif from '../styles/imgs/loading.gif';
import '../styles/loading.css';

const Loading = () => {

  return (
    <AnimatePresence>
    <motion.div { ...componentMotion } className="menu-form">
      <h1 id="loading-title">Loading...</h1>
      <img id="loading-img" src={ loadingGif }/>
      <span id="loading-desc">Please, stand by</span>
    </motion.div>
    </AnimatePresence>
  );
};

export default Loading;
