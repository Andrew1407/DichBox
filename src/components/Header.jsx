import React, { useContext, useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { MenuContext } from '../contexts/MenuContext';
import { BoxesContext } from '../contexts/BoxesContext';
import { VerifiersContext } from '../contexts/VerifiersContext';
import defaultLogo from '../styles/imgs/default-user-logo.png';
import searchLogo from '../styles/imgs/search.png';
import showArrow from '../styles/imgs/menu-show.png';
import '../styles/header.css';

const Header = () => {
  const history = useHistory();
  const {
    username,
    setPathName,
    pathName,
    dispatchUserData
  } = useContext(UserContext);
  const {
    menuVisible,
    setMenuVisible,
    setSearchStr,
    searchStr,
    setUsersList,
    setFoundErr,
    foundErr
  } = useContext(MenuContext);
  const { dispatchDataInput, cleanWarnings } = useContext(VerifiersContext);
  const { setBoxesList, setBoxHiddenState, setBoxDetails } = useContext(BoxesContext);
  const [searchInput, setSearchInput] = useState('');
  const [hidden, setHidden] = useState(false);
  const handleSearchClick = () => {
    if (foundErr) setFoundErr(null);
    if (searchInput) setSearchStr(searchInput);
  };

  const handleSearchInput = e => {
    e.preventDefault();
    const input = e.target.value;
    setSearchInput(input);
    setSearchStr(searchStr || null);
  };

  const handleMenuClickClb = () => {
    const currentUsername = username || '';
    const currentPathName = pathName || '';
    if (foundErr) setFoundErr(null);
    if (searchInput) setSearchInput('');
    if (searchStr) {
      setUsersList(null);
      setSearchStr('');
      return;
    }
    if (currentPathName === currentUsername) {
      setMenuVisible(!menuVisible);
    } else {
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
  const handleMenuClick = useCallback(
    handleMenuClickClb,
    [username, menuVisible, pathName, searchStr, searchInput, foundErr]
  );
  const backgroundColor = username ? 'rgb(50, 211, 240)' : 'grey';       //for image state

  return (
    !hidden ?
      <div id="header">
        <div id="header-name">
          <h1>DichBox</h1>
        </div>
        <div id="header-menu">
          <img src={ defaultLogo } onClick={ handleMenuClick } style={{ backgroundColor }} onDoubleClick={ () => setHidden(true) } /> 
        </div>
        <form id="header-search" onSubmit={ e => (e.preventDefault(), handleSearchClick()) }>
          <input value={ searchInput } type="text" placeholder="search users" onChange={ handleSearchInput } />
          <img src={ searchLogo } onClick={ handleSearchClick } />
        </form>
      </div> :
      <img id="header-hidden" src={ showArrow } onClick={ () => setHidden(false) } />
  );
};

export default Header;
