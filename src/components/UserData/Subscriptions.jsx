import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { MenuContext } from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import logoUnsubscribe from '../../styles/imgs/unsubscribe.png';
import '../../styles/users-list.css';

const Subscriptions = () => {
  const history = useHistory();
  const { usersList, setUsersList, setLoading } = useContext(MenuContext);
  const { userData } = useContext(UserContext);
  const [searchInput, setSearchInput] = useState('');
  const shortenName = str => str.length < 20 ? str : `${str.slice(0, 19)}...`;
  const handleUnsubscribeClb = subscriptionName => async () => {
    setLoading(true);
    const unsubBody = {
      subscriptionName,
      action: 'unsubscribe',
      personName: userData.name,
      responseValues: false
    };
    const { data } = await axios.post(`${process.env.APP_ADDR}/users/subscription`, unsubBody);
    if (data.unsubscribed)
      setUsersList(usersList.filter(s => 
        s.name !== subscriptionName
      ));
    setLoading(false);
  };
  const handleUnsubscribe = useCallback(
    handleUnsubscribeClb,
    [userData, usersList]
  );

  const handlePersonClick = username => () => {
    history.push(`/${username}`);
    setUsersList(null);
  };

  let foundPersons = [];
  if (usersList)
    foundPersons = usersList.filter(s => s.name.includes(searchInput));

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      const subsBody = { name: userData.name };
      const { data } =  await axios.post(`${process.env.APP_ADDR}/users/subs_list`, subsBody);
      const { subs } = data;
      if (subs) setUsersList(subs);
      setLoading(false);
    };

    if (!usersList && userData.name)
      fetchSubscriptions();
  }, [userData]);

  return (
    <div className="menu-form">
      <h1 id="subs-header">Subscriptions</h1>
      <div id="subs-search">
        <label>search: </label>
        <input type="text" spellCheck="false" value={ searchInput } onChange={ e => setSearchInput(e.target.value) }/>
      </div>
      { !foundPersons.length ? 
        <div>
          <h1 id="subs-empty">No subscriptions were found</h1>
        </div> :
        <div>
          { foundPersons.map(person =>
            <div key={ person.name } className="subs-display sub-person" onClick={ handlePersonClick(person.name) }>
              <div className="subs-data subs-display">
                <img src={ person.logo || logoDefault }/>
                <span style={{ color: person.name_color }}>{ shortenName(person.name) }</span>
              </div>
              <img title={`Unsubscribe from "${person.name}"`} src={ logoUnsubscribe } onClick={ handleUnsubscribe(person.name) }/>
            </div>
          )}
        </div>
      }
    </div>
  );
};

export default Subscriptions;
