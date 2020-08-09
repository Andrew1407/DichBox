import React, { createContext, useState, useEffect, useReducer } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import  userDataReducer from '../reducers/userDataReducer';
import  userIdReducer from '../reducers/userIdReducer';

export const UserContext = createContext();

const UserContextProvider = props => {
  const history = useHistory();
  const getPathName = () => history
    .location
    .pathname
    .split('/')[1];
  const [pathName, setPathName] = useState(getPathName());
  const [menuVisible, setMenuVisible] = useState(true);
  const [username, setUsername] = useState('');
  const [userData, dispatchUserData] = useReducer(userDataReducer, {});
  const [id, dispatchId] = useReducer(userIdReducer, Number(localStorage.getItem('id')));

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
        dispatchUserData({ type: 'REFRESH_DATA', data });
      }
    };
    
    fetchUserData();
  }, [pathName]);

  return (
    <UserContext.Provider value={{ menuVisible, setMenuVisible, id, dispatchId, username, setUsername, dispatchUserData, userData, pathName, setPathName }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
