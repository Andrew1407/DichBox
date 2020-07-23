import React, { useState } from 'react';
import Boxes from './Boxes';
import Default from './Default';

const UserData = () => {
  const [menuOption, setMenuOption] = useState('default');
  const menuChioce = {
    default: <Default {...{ menuOption, setMenuOption }} />,
    boxes: <Boxes {...{ menuOption, setMenuOption }} />
  };

  return menuChioce[menuOption];
};

export default UserData;
