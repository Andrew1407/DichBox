import React, { createContext, useState, useReducer } from 'react';
import filesReducer from '../reducers/filesReducer';

export const MenuContext = createContext();

const MenuContextProvider = props => {
  const [menuOption, setMenuOption] = useState('default');
  const [menuVisible, setMenuVisible] = useState(true);
  const [openedFiles, dispatchOpenedFiles] = useReducer(filesReducer, []);


  return (
    <MenuContext.Provider value={{ openedFiles, dispatchOpenedFiles, menuVisible, setMenuVisible, menuOption, setMenuOption }}>
      { props.children }
    </MenuContext.Provider>
  );
};

export default MenuContextProvider;
