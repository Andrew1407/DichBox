import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const MainContext = createContext();

const MainContextProvider = props => {
  const [menuVisible, setMenuVisible] = useState(true);
  const [userData, setUserDataState] = useState({
    id: localStorage.getItem('id')
  });
  const setUserData = user => {
    localStorage.setItem('id', user.id);
    setUserDataState(user);
  };
  const getUserData = async () => {
    const resBody = {
      id: userData.id,
      ownPage: true
    };
    const { data } = await axios.post('http://192.168.0.223:7041/users/find', resBody);
    setUserDataState(data);
  };
  useEffect(() => {
    if (userData.id) getUserData();
  }, []);
    
  return (
    <MainContext.Provider value={{ menuVisible, setMenuVisible, userData, setUserData }}>
      {props.children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;
