import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import loadingGif from '../styles/imgs/loading.gif';
import '../styles/loading.css';

const Loading = () => {

  return (
    <AnimatePresence>
    <motion.div
      className="menu-form"
      initial={{ x: -800 }}
      animate={{ x: 0 }}
      exit={{ x: -800 }}
      transition={{ duration: 0.3, type: 'tween' }}
    >
      <h1 id="loading-title">Loading...</h1>
      <img id="loading-img" src={ loadingGif }/>
      <span id="loading-desc">Please, stand by</span>
    </motion.div>
    </AnimatePresence>
  );
};

export default Loading;
