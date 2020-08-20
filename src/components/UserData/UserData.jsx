import React, { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';
import { useParams, Route, Switch } from 'react-router-dom';
import Boxes from './Boxes';
import Default from './Default';
import EditProfile from './EditProfile';
import BoxForm from './BoxForm';
import BoxEntries from './BoxEntries';

const UserData = () => {
  const { setPathName, pathName } = useContext(UserContext);
  const { menuOption } = useContext(MenuContext);
  const { username } = useParams();
  useEffect(() => {
    if (username !== pathName)
      setPathName(username);
  }, [username])
  const menuChioces = {
    default: <Default />,
    boxes: <Boxes />,
    editProfile: <EditProfile />,
    createBox: <BoxForm editParametrs={{ boxDetails: {} }} />,
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
