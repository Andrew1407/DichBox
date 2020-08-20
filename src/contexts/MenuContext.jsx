import React, { createContext, useState } from 'react';

export const MenuContext = createContext();

const MenuContextProvider = props => {
  const [menuOption, setMenuOption] = useState('default');
  const [menuVisible, setMenuVisible] = useState(true);


  return (
    <MenuContext.Provider value={{ menuVisible, setMenuVisible, menuOption, setMenuOption }}>
      { props.children }
    </MenuContext.Provider>
  );
};

export default MenuContextProvider;
