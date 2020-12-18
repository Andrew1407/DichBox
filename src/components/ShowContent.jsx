import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilesList from './FilesContent/FilesList';
import ShowArea from './FilesContent/ShowArea';
import { MenuContext } from '../contexts/MenuContext';
import { contentMotion } from '../styles/motions/menu-components';
import '../styles/show-content.css';

const ShowContent = () => {
  const { openedFiles } = useContext(MenuContext);

  return ( 
    <AnimatePresence>
    { !!openedFiles.length &&
      <motion.div { ...contentMotion } id="show-content">
        <FilesList />
        <ShowArea />
      </motion.div>
    }
    </AnimatePresence>
  );
};

export default ShowContent;
