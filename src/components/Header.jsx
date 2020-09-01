import React, { useContext, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { MenuContext } from '../contexts/MenuContext';
import { BoxesContext } from '../contexts/BoxesContext';
import { VerifiersContext } from '../contexts/VerifiersContext';
import HeaderSearch from './HeaderSearch';
import defaultLogo from '../styles/imgs/default-user-logo.png';
import '../styles/header.css';

const Header = () => {
  const history = useHistory();
  const {
    username,
    setPathName,
    pathName,
    dispatchUserData
  } = useContext(UserContext);
  const { menuVisible, setMenuVisible } = useContext(MenuContext);
  const { dispatchDataInput, cleanWarnings } = useContext(VerifiersContext);
  const { setBoxesList, setBoxHiddenState, setBoxDetails } = useContext(BoxesContext);
  const [searchInput, setSearchInput] = useState('');
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
        <input type="text" placeholder="search users" onChange={ e => setSearchInput(e.target.value) } />
      </div>
      <HeaderSearch {...{ searchInput }}/>
    </div>
  );
};

export default Header;
