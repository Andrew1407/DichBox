import React, { createContext, useState, useReducer, useCallback } from 'react';
import filesReducer from '../reducers/filesReducer';

export const MenuContext = createContext();

const MenuContextProvider = props => {
  const [menuOption, setMenuOption] = useState('default');
  const [menuVisible, setMenuVisible] = useState(true);
  const [openedFiles, dispatchOpenedFiles] = useReducer(filesReducer, []);
  const [usersList, setUsersList] = useState(null);
  const [searchStr, setSearchStr] = useState(null);
  const [foundErr, setFoundErr] = useState(null);
  const [isLodaing, setLoading] = useState(false);

  const searchFileInOpenedListClb = (searchName, searchPath) => {
    for (const index in openedFiles) {
      const { name, filePath, opened } = openedFiles[index];
      const fp = filePath[0] === '/' ? filePath : `/${filePath}`;
      const found = searchName === name && searchPath === fp;
      if (found) return { index, opened };
    }
    return { index: -1 };
  };
  const searchFileInOpenedList = useCallback(searchFileInOpenedListClb, [openedFiles]);

  return (
    <MenuContext.Provider value={{ isLodaing, setLoading, foundErr, setFoundErr, searchStr, setSearchStr, usersList, setUsersList, searchFileInOpenedList, openedFiles, dispatchOpenedFiles, menuVisible, setMenuVisible, menuOption, setMenuOption }}>
      { props.children }
    </MenuContext.Provider>
  );
};

export default MenuContextProvider;
