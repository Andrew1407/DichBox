import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { MenuContext } from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import NoteMessage from './NoteMessage';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import trashBin from '../../styles/imgs/trash-bin.png';
import '../../styles/notifications.css';

const Notifications = () => {
  const { usersList, setUsersList, setLoading } = useContext(MenuContext);
  const { userData, dispatchUserData } = useContext(UserContext);

  const handleRemove = (...ntsIds) => async () => {
    const rmBody = { ntsIds, username: userData.name };
    const { data } =  await axios.post(`${process.env.APP_ADDR}/users/notifications_remove`, rmBody);
    if (!data.removed) return;
    dispatchUserData({
      type: 'REFRESH_DATA',
      data: { 
        notifications: userData.notifications - ntsIds.length  
      }
    });
    const ntsLast = usersList.filter(ntf => !ntsIds.includes(ntf.id)); 
    setUsersList(ntsLast);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const ntsBody = { name: userData.name };
      const { data } =  await axios.post(`${process.env.APP_ADDR}/users/notifications_list`, ntsBody);
      const { notifications } = data;
      if (notifications)
        setUsersList(notifications);
      setLoading(false);
    };

    if (!usersList && userData.name)
      fetchNotifications();
  }, [userData]);

  return (
    <div className="menu-form">
      <h1 id="nts-header">Notifications{ 
        !!(+userData.notifications) &&  <span> ({ userData.notifications })</span> 
      }</h1>
      { !(usersList && usersList.length) ?
        <div>
          <h1 id="nts-empty">Notifications list is empty</h1>
        </div> :
        <div>
          <input id="nts-clear-all" type="button" value="clear all" onClick={ handleRemove(...usersList.map(x => x.id)) }/>
          { usersList.map((ntf, i) => (
            <div className="nts-msg" key={ i }>
              <div className="head">
                <div className="head-left">
                  <img src={ ntf.icon || logoDefault }/>
                  <p>{ ntf.note_date }</p>
                </div>
                <img src={ trashBin } className="ntf-remove" onClick={ handleRemove(ntf.id) }/>
              </div>
              <NoteMessage {...{ type: ntf.type, userName: ntf.user_name, userColor: ntf.user_color, boxName: ntf.box_name, boxColor: ntf.box_color, msg: ntf.msgEntries }} />
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default Notifications;
