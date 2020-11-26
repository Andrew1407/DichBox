import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { MenuContext } from '../contexts/MenuContext';
import logoDefault from '../styles/imgs/default-user-logo.png'
import '../styles/users-list.css';


const SearchList = () => {
  const {
    searchStr,
    setSearchStr,
    usersList,
    setUsersList,
  } = useContext(MenuContext);
  const history = useHistory();
  const shortenName = str => str.length < 20 ? str : `${str.slice(0, 19)}...`;
  const handlePersonClick = username => () => {
    history.push(`/${username}`);
    setSearchStr('');
    setUsersList(null);
  };

  useEffect(() => {
    const fetchUsersSearch = async () => {
      const { data } = await axios.post(`${process.env.APP_ADDR}/users/search`, { searchStr });
      const { searched } = data;
      if (searched) setUsersList(searched);
    };

    fetchUsersSearch()
  }, [searchStr]);

  return (
    <div className="menu-form">
      <h1 id="search-list-header">Found users</h1>
      { usersList && usersList.filter(x => x).length ? 
        usersList.map(person => 
          <div className="search-list-display search-list-person" key={ person.name }>
            <div onClick={ handlePersonClick(person.name) } className="search-list-data search-list-display">
              <img src={ person.logo || logoDefault }/>
              <span style={{ color: person.name_color }}>{ shortenName(person.name) }</span>
            </div>
          </div>
        ) :
        <h1 id="search-list-none">No users were found</h1>
      }
    </div>
  );
};

export default SearchList;
