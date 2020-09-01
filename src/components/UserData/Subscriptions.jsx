import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { MenuContext } from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import '../../styles/subscriptions.css';

const Subscriptions = () => {
  const { subscriptions, setSubscriptions } = useContext(MenuContext);
  const { userData } = useContext(UserContext);
  useEffect(() => {
    const fetchSubscriptions = async () => {
      const subsBody = { name: userData.name };
      const { data } =  await axios.post(`${process.env.APP_ADDR}/users/subs_list`, subsBody);
      const { subs } = data;
      if (subs)
        setSubscriptions(subs);
    };

    if (!subscriptions && userData.name)
      fetchSubscriptions();
  }, [userData]);

  return (
    <div className="menu-form">
      <h1 id="subs-header">Subscriptions</h1>
      { subscriptions && subscriptions.map(person => 
        <div key={ person.name }>
          <img src={ person.logo }/>
          <p style={{ color: person.name_color }}>{ person.name }</p>
        </div>  
      )}
    </div>
  );
};

export default Subscriptions;
