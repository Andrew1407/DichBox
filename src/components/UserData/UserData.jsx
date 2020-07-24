import React, { useState, useContext, useEffect } from 'react';
import { MainContext } from '../../contexts/MainContext';
import { useParams } from 'react-router-dom';
import Boxes from './Boxes';
import Default from './Default';
import EditProfile from './EditProfile';

const UserData = ({ menuOption, setMenuOption }) => {
  const { setPathName, pathName } = useContext(MainContext);
  const { username } = useParams();
  useEffect(() => {
    if (username !== pathName)
      setPathName(username);
  }, [username])
  const menuChioces = {
    default: <Default {...{ setMenuOption }} />,
    boxes: <Boxes {...{ setMenuOption }} />,
    editProfile: <EditProfile {...{ setMenuOption }} />
  };

  return menuChioces[menuOption];
};

export default UserData;
