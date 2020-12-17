import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilesList from './FilesContent/FilesList';
import ShowArea from './FilesContent/ShowArea';
import { MenuContext } from '../contexts/MenuContext';
import '../styles/show-content.css';

const ShowContent = () => {
  const { openedFiles } = useContext(MenuContext)

  return ( 
    <AnimatePresence>
    { !!openedFiles.length &&
      <motion.div
        id="show-content"
        initial={{ x: 2000 }}
        animate={{ x: 0 }}
        exit={{ x: 2000 }}
        transition={{ type: 'tween' }}
      >
        <FilesList />
        <ShowArea />
      </motion.div>
    }
    </AnimatePresence>
  );
};

export default ShowContent;
