import React, { useContext, useCallback } from 'react';
import { UserContext } from '../contexts/UserContext';
import { MenuContext } from '../contexts/MenuContext';
import { BoxesContext } from '../contexts/BoxesContext';
import { useHistory } from 'react-router-dom';
import { VerifiersContext } from '../contexts/VerifiersContext';
import defaultLogo from '../styles/imgs/default-user-logo.png';
import '../styles/header.css';

const Header = () => {
  const {
    username,
    setPathName,
    pathName,
    dispatchUserData
  } = useContext(UserContext);
  const { menuVisible, setMenuVisible } = useContext(MenuContext);
  const { dispatchDataInput, cleanWarnings } = useContext(VerifiersContext);
  const { setBoxesList, setBoxHiddenState, setBoxDetails } = useContext(BoxesContext);
  const history = useHistory();
  const handleMenuClickClb = () => {
    const currentUsername = username || '';
    const currentPathName = pathName || '';
    if (currentPathName === currentUsername) {
      setMenuVisible(!menuVisible);
    }
    else {
      setMenuVisible(true);
      setPathName(username);
      dispatchUserData({ type: 'CLEAN_DATA' });
      setBoxDetails({});
      setBoxesList([]);
      setBoxHiddenState(false);
      history.push('/');
    }
    dispatchDataInput({ type: 'CLEAN_DATA' });
    cleanWarnings();
  };
  const handleMenuClick = useCallback(handleMenuClickClb, [username, menuVisible, pathName]);
  const backgroundColor = username ? 'rgb(50, 211, 240)' : 'grey';       //for image state

  return (
    <div id="header">
      <div id="header-name">
        <h1>DichBox</h1>
      </div>
      <div id="header-menu">
        <img src={defaultLogo} onClick={ handleMenuClick } style={{ backgroundColor }} /> 
      </div>
      <div id="header-search">
        <input type="text" placeholder="search users" />
      </div>
    </div>
  );
};

export default Header;
