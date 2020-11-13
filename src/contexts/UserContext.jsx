import React, { createContext, useState, useEffect, useReducer, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { MenuContext } from './MenuContext';
import  userDataReducer from '../reducers/userDataReducer';
import  usernameReducer from '../reducers/usernameReducer';

export const UserContext = createContext();

const UserContextProvider = props => {
  const history = useHistory();
  const { setFoundErr, foundErr } = useContext(MenuContext);
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
        try {
          const { data } = await axios.post(`${process.env.APP_ADDR}/users/find`, findBody);
          dispatchUserData({ type: 'REFRESH_DATA', data });
        } catch (e) {
          const { status, data } = e.response;
          const errType = status === 404 ? 'user' : 'server'; 
          setFoundErr([errType, data.msg]);
        }
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
