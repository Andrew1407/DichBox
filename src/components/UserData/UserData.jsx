import React, { useState, useContext, useEffect } from 'react';
import { MainContext } from '../../contexts/MainContext';
import { useParams, Route, Switch } from 'react-router-dom';
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
    boxes: <Boxes {...{ menuOption, setMenuOption }} />,
    editProfile: <EditProfile {...{ setMenuOption }} />
  };

  return (
    <Switch>
      <Route path="/:username/:box">
        { menuChioces['boxes'] }
      </Route>
      <Route expact path="/:username">
        { menuChioces[menuOption] }
      </Route>
    </Switch>
  );
};

export default UserData;
