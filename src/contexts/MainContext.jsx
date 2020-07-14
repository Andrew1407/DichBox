import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const MainContext = createContext();

const MainContextProvider = props => {
  const [isHidden, setMenuHidden] = useState(true);
  const [userData, setUserData] = useState(null);
  const userId = localStorage.getItem('userId');
  useEffect(() => {
    axios.post('http://192.168.0.223:7041/findUser',
      { name: 'sasik', visitor: false }
    ).then(({ data }) => setUserData(data));
  }, []);

  return (
    <MainContext.Provider value={{ isHidden, setMenuHidden, userId, userData }}>
      {props.children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;
