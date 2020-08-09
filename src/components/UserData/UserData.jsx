import React, { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { useParams, Route, Switch } from 'react-router-dom';
import Boxes from './Boxes';
import Default from './Default';
import EditProfile from './EditProfile';
import CreateBox from './CreateBox';
import BoxEntries from './BoxEntries';

const UserData = ({ menuOption, setMenuOption }) => {
  const { setPathName, pathName } = useContext(UserContext);
  const { username } = useParams();
  useEffect(() => {
    if (username !== pathName)
      setPathName(username);
  }, [username])
  const menuChioces = {
    default: <Default {...{ setMenuOption }} />,
    boxes: <Boxes {...{ menuOption, setMenuOption }} />,
    editProfile: <EditProfile {...{ menuOption, setMenuOption }} />,
    createBox: <CreateBox {...{ setMenuOption }} />,
    boxEntries: <BoxEntries />
  };

  return (
    <Switch>
      <Route path="/:username/:box">
        { menuChioces.boxEntries }
      </Route>
      <Route expact path="/:username">
        { menuChioces[menuOption] }
      </Route>
    </Switch>
  );
};

export default UserData;
