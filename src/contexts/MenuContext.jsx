import React, { createContext, useState } from 'react';

export const MenuContext = createContext();

const MenuContextProvider = props => {
  const [menuIsHidden, setMenuState] = useState(true);
  const userId = localStorage.getItem('userId');
  return (
    <MenuContext.Provider value={{ menuIsHidden, setMenuState, userId }} >
      {props.children}
    </MenuContext.Provider>
  )
};

export default MenuContextProvider;
