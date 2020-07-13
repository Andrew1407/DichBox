import React, { createContext, useState } from 'react';

export const MainContext = createContext();

const MainContextProvider = props => {
  const [isHidden, setMenuHidden] = useState(true);
  const userId = localStorage.getItem('userId');

  return (
    <MainContext.Provider value={{ isHidden, setMenuHidden, userId }}>
      {props.children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;
