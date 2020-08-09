import React, { useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import trashBin from '../../styles/imgs/trash-bin.png';
import '../../styles/box-privacy.css';



const BoxPrivacy = ({ privacy, dispatchPrivacy }) => {
  const { username } = useContext(UserContext);
  const [foundUsers, setFoundUsers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const radios = [
    ['public'],
    ['private'],
    ['followers', '(for subscribers only)'],
    ['limited', '(choose users and access)']
  ];
  const handleRadioChangeClb = e => {
    dispatchPrivacy({ type: 'SET_PRIVACY', privacy: e.target.value });
    setFoundUsers([]);
    setUsersList([]);
    setSearchInput('');
  };
  const handleRadioChange = useCallback(handleRadioChangeClb, []);
  
  const handleFoundUserClickClb = foundUser => e => {
    e.preventDefault();
    if (foundUser.name === username) return;
    for (const user of usersList) {
      if (user.name === foundUser.name) return;
    }
    setUsersList([ ...usersList, { ...foundUser, access_level: 'view' }]);
    dispatchPrivacy({ 
      type: 'ACCESS_LIST_PUSH',
      value: {
        name: foundUser.name,
        access_level: 'view'
      }
    });
    setFoundUsers([]);
    setSearchInput('');
  };
  const handleFoundUserClick = useCallback(handleFoundUserClickClb, [usersList]);

  const handleUserInputClb = async e => {
    e.preventDefault();
    const nameTemplate = e.target.value;
    setSearchInput(nameTemplate);
    if (nameTemplate) {
      const { data } = await axios.post('http://192.168.0.223:7041/users/names_list', { nameTemplate });
      setFoundUsers(data.foundUsers);
    } else {
      setFoundUsers([]);
    }
  };
  const handleUserInput = useCallback(handleUserInputClb, [])

  const handleUserAccessClb =  pickedUser => e => {
    e.preventDefault();
    const access_level = e.target.value;
    const usersModified = usersList.map(user => 
       (user.name === pickedUser.name) ?
        { ...user, access_level }:
        user
    );
    setUsersList(usersModified);
    dispatchPrivacy({
      type: 'SET_ACCESS_LIST',
      value: usersModified.map(({ name, access_level }) => (
        { name, access_level }
      ))
    });
  };
  const handleUserAccess = useCallback(handleUserAccessClb, [usersList])

  const handleUserRemoveClb = user => () => {
    const usersModified =usersList.filter(x => 
      x.name !== user.name
    );
    setUsersList(usersModified);
    dispatchPrivacy({
      type: 'SET_ACCESS_LIST',
      value: usersModified.map(({ name, access_level }) => (
        { name, access_level }
      ))
    });
  };
  const handleUserRemove = useCallback(handleUserRemoveClb, [usersList]);

  const handeClearOnClick = e => {
    e.preventDefault();
    setSearchInput('');
    setFoundUsers([]);
  };

  return (
    <div className="box-privacy">
      <p>*box privacy:</p>
      { radios.map(val =>
        <div className="box-privacy-radio" key={ val[0] } >
          <input type="radio" {...{ value: val[0], name: val[0] + 'Radio', checked: privacy.type === val[0], onChange: handleRadioChange }} />
          <label htmlFor={ val[0] + 'Radio' }>{ val.join(' ') }</label>
        </div>
      )}
      { (privacy.type === 'limited') &&
        <div className="box-limited">
          <div className="box-limited-input">
            <label htmlFor="limitedList">username:</label>
            <input type="text" name="limitedList" value={ searchInput } onChange={ handleUserInput } />
            <button onClick={ handeClearOnClick }>clear</button>
            { !!foundUsers.length && 
              <div className="box-limited-search">
                { foundUsers.map(user => 
                  <div className="found-user" key={ user.name } onClick={ handleFoundUserClick(user) } >
                    <img src={ user.logo ? user.logo : logoDefault } />
                    <span>{ user.name }</span>
                  </div>
                )}
              </div>
            }
          </div>
          <div className="box-limited-list">
            { usersList.map(user =>
              <div className="limited-user" key={ user.name }>
                <div className="limited-user-data" >
                  <img src={ user.logo ? user.logo : logoDefault } />
                  <span>{ user.name }</span>
                </div>
                <div className="limited-user-options">
                  <input type="button" value="view" disabled={ user.access_level === 'view' } onClick={ handleUserAccess(user) } style={ user.access_level === 'view' ? { backgroundColor: 'rgb(0, 217, 255)', color: 'black' } : { backgroundColor: 'black', color: 'rgb(0, 217, 255)' } } />
                  <input type="button" value="edit" disabled={ user.access_level === 'edit' } onClick={ handleUserAccess(user) } style={ user.access_level === 'edit' ? { backgroundColor: 'rgb(0, 217, 255)', color: 'black' } : { backgroundColor: 'black', color: 'rgb(0, 217, 255)' } } />
                  <img src={ trashBin } onClick={ handleUserRemove(user) } />
                </div>
              </div>
            )}
          </div>
        </div>
      }
    </div>
  );
};

export default BoxPrivacy;
