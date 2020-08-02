import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

export const MainContext = createContext();

const MainContextProvider = props => {
  const history = useHistory();
  const getPathName = () => history
    .location
    .pathname
    .split('/')[1];
  const [pathName, setPathName] = useState(getPathName());
  const [menuVisible, setMenuVisible] = useState(true);
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState({});
  const [id, idState] = useState(localStorage.getItem('id'));
  const setId = id => {
    localStorage.setItem('id', id);
    idState(id);
  };

  useEffect(() => {
    const fetchUsername = async () => {
      if (id) {
        const { data } = await axios.post('http://192.168.0.223:7041/users/name', { id });
        setUsername(data.name);
      }
    };
    
    fetchUsername();
  }, [id]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (pathName && pathName.length) {
        const findBody = { id, name: pathName };
        const { data } = await axios.post('http://192.168.0.223:7041/users/find', findBody);
        setUserData(data)
      }
    };
    
    fetchUserData();
  }, [pathName]);
  
  return (
    <MainContext.Provider value={{ menuVisible, setMenuVisible, id, setId, username, setUsername, setUserData, userData, pathName, setPathName }}>
      {props.children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;
