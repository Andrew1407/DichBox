import React, { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';
import { useParams, Route, Switch } from 'react-router-dom';
import Boxes from './Boxes';
import Default from './Default';
import EditProfile from './EditProfile';
import BoxForm from './BoxForm';
import BoxEntries from './BoxEntries';
import Subscriptions from './Subscriptions';
import Notifications from './Notifications';
import Errors from '../Errors/Errors';

const UserData = () => {
  const { setPathName, pathName } = useContext(UserContext);
  const { menuOption, foundErr } = useContext(MenuContext);
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
    boxEntries: <BoxEntries />,
    subscriptions: <Subscriptions />,
    notifications: <Notifications />
  };

  return (
    <Switch>
      <Route path="/:username/:box">
        { menuChioces.boxEntries }
      </Route>
      <Route expact path="/:username">
        { foundErr ? <Errors /> : menuChioces[menuOption] }
      </Route>
    </Switch>
  );
};

export default UserData;
