import React, { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';
import { useParams, Route, Switch, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Boxes from './Boxes';
import Default from './Default';
import EditProfile from './EditProfile';
import BoxForm from './BoxForm';
import BoxEntries from './BoxEntries';
import Subscriptions from './Subscriptions';
import Notifications from './Notifications';

const UserData = () => {
  const { setPathName, pathName } = useContext(UserContext);
  const { menuOption } = useContext(MenuContext);
  const { username } = useParams();
  const location = useLocation();
  useEffect(() => {
    if (username !== pathName)
      setPathName(username);
  }, [username])
  const menuChoices = {
    default: <Default />,
    boxes: <Boxes />,
    editProfile: <EditProfile />,
    createBox: <BoxForm editParametrs={{ boxDetails: {} }} />,
    boxEntries: <BoxEntries />,
    subscriptions: <Subscriptions />,
    notifications: <Notifications />
  };

  return (
    <AnimatePresence exitBeforeEnter>
    <Switch location={location} key={location.key}>
      <Route path="/:username/:box">
        { menuChoices.boxEntries }
      </Route>
      
      <Route expact path="/:username">
        { menuChoices[menuOption] }
      </Route>
    </Switch>
    </AnimatePresence>
  );
};

export default UserData;
