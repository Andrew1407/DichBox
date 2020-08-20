import React, { createContext, useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import  userDataReducer from '../reducers/userDataReducer';
import  usernameReducer from '../reducers/usernameReducer';

export const UserContext = createContext();

const UserContextProvider = props => {
  const history = useHistory();
  const getPathName = () => history
    .location
    .pathname
    .split('/')[1];
  const [pathName, setPathName] = useState(getPathName());
  const [username, dispatchUsername] = useReducer(usernameReducer, localStorage.getItem('name'));
  const [userData, dispatchUserData] = useReducer(userDataReducer, {});
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (pathName && pathName.length) {
        const findBody = { username, pathName };
        const { data } = await axios.post('http://192.168.0.223:7041/users/find', findBody);
        dispatchUserData({ type: 'REFRESH_DATA', data });
      }
    };
    
    fetchUserData();
  }, [pathName]);

  return (
    <UserContext.Provider value={{ username, dispatchUsername, dispatchUserData, userData, pathName, setPathName }}>
      { props.children }
    </UserContext.Provider>
  );
};

export default UserContextProvider;
