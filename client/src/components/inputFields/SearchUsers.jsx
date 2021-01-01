import React, { useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UserContext } from '../../contexts/UserContext';
import { itemMotion } from '../../styles/motions/list-items';
import { bouncingMotion } from '../../styles/motions/bouncing-icons';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import trashBin from '../../styles/imgs/trash-bin.png';
import '../../styles/search-box.css';

const SearchUsers = ({ changedList, setChangedList, inputList, setInputList }) => {
  const { username } = useContext(UserContext);
  const [foundUsers, setFoundUsers] = useState([]);
  const [searchInput, setSearchInput] = useState('');

  const handleUserInputClb = async e => {
    e.preventDefault();
    const nameTemplate = e.target.value;
    setSearchInput(nameTemplate);
    if (nameTemplate) {
      const listBody = { nameTemplate, username }
      const { data } = await axios.post(`${process.env.APP_ADDR}/users/names_list`, listBody);
      setFoundUsers(data.foundUsers);
    } else {
      setFoundUsers([]);
    }
  };
  const handleUserInput = useCallback(handleUserInputClb, [])

  const handeClearOnClick = e => {
    e.preventDefault();
    setSearchInput('');
    setFoundUsers([]);
  };

  const handleUserRemoveClb = user => () => {
    const usersModified = inputList.filter(x => 
      x.name !== user.name
    );
    setInputList(usersModified);
    if (!changedList)
      setChangedList(true);
  };
  const handleUserRemove = useCallback(handleUserRemoveClb, [inputList]);

  const handleFoundUserClickClb = foundUser => e => {
    e.preventDefault();
    for (const user of inputList) {
      if (user.name === foundUser.name) return;
    }
    setInputList([ ...inputList, foundUser ]);
    if (!changedList)
      setChangedList(true);
    setFoundUsers([]);
    setSearchInput('');
  };
  const handleFoundUserClick = useCallback(handleFoundUserClickClb, [inputList]);
  const shortenName = str => str.length < 20 ? str : `${str.slice(0, 19)}...`;


  return (
    <div className="box-limited">
      <div className="box-limited-input">
        <label htmlFor="limitedList">username:</label>
        <input type="text" name="limitedList" value={ searchInput } onChange={ handleUserInput } />
        <button onClick={ handeClearOnClick }>clear</button>
        { !!foundUsers.length && 
          <div className="box-limited-search">
            { foundUsers.map(user => 
              <div title={ user.name } className="found-user" key={ user.name } onClick={ handleFoundUserClick(user) } >
                <img src={ user.logo || logoDefault } />
                <motion.span
                  { ...itemMotion }
                  style={{ color: user.name_color }}
                >{ shortenName(user.name) }</motion.span>
              </div>
          )}
          </div>
        } 
      </div>
      <div className="box-limited-list">
        { inputList.map(user =>
          <div className="limited-user" key={ user.name }>
            <div title={ user.name } className="limited-user-data" >
              <img src={ user.logo || logoDefault } />
              <motion.span
                { ...itemMotion }
                style={{ color: user.name_color }}
              >{ shortenName(user.name) }</motion.span>
            </div>           
            <motion.img
              { ...bouncingMotion }
              src={ trashBin } className="limited-user-rm" onClick={ handleUserRemove(user) }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchUsers;
