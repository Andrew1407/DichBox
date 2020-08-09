import React, { useContext, useCallback } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useHistory } from 'react-router-dom';
import { VerifiersContext } from '../contexts/VerifiersContext';
import defaultLogo from '../styles/imgs/default-user-logo.png';
import '../styles/header.css';

const Header = () => {
  const { menuVisible, setMenuVisible, username, id, setPathName, pathName } = useContext(UserContext);
  const { dispatchDataInput, cleanWarnings } = useContext(VerifiersContext);
  const history = useHistory();
  const handleMenuClickClb = e => {
    e.preventDefault();
    if (pathName === username) {
      setMenuVisible(!menuVisible);
    }
    else {
      setMenuVisible(true);
      setPathName(username)
      history.push('/');
    }
    dispatchDataInput({ type: 'CLEAN_DATA' });
    cleanWarnings();
  };
  const handleMenuClick = useCallback(handleMenuClickClb, [username, menuVisible, pathName]);
  const backgroundColor = id ? 'rgb(50, 211, 240)' : 'grey';       //for image state

  return (
    <div id="header">
      <div id="header-name">
        <h1>DichBox</h1>
      </div>
      <div id="header-menu">
        <img src={defaultLogo}  onClick={ handleMenuClick } style={{ backgroundColor }} />
      </div>
      <div id="header-search">
        <input type="text" placeholder="search boxes" />
      </div>
    </div>
  );
};

export default Header;
