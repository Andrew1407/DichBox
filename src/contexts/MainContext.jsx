import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

export const MainContext = createContext();

const MainContextProvider = props => {
  const history = useHistory();
  const [menuVisible, setMenuVisible] = useState(true);
  const [username, setUsername] = useState(null);
  const [userData, setUserData] = useState({});
  const [id, idState] = useState(localStorage.getItem('id'));
  const setId = id => {
    localStorage.setItem('id', id);
    idState(id);
  };
  useEffect(() => {
    const fetchData = async () => {
      let username = null;
      if (id) {
        const fetchName = await axios.post('http://192.168.0.223:7041/users/name', { id });
        username = fetchName.data.name;
      }
      const pathName = history.location.pathname.split('/')[1];
      if (pathName.length) {
        const findBody = {
          name: pathName,
          ownPage: pathName === username
        };
        const { data } = await axios.post('http://192.168.0.223:7041/users/find', findBody);
        setUserData(data)
      }
      setUsername(username);
    };

    fetchData();
  }, [username])

  
  return (
    <MainContext.Provider value={{ menuVisible, setMenuVisible, id, setId, username, userData }}>
      {props.children}
    </MainContext.Provider>
  );
};

export default MainContextProvider;
