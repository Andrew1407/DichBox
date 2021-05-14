import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MenuContext } from '../../contexts/MenuContext';
import { UserContext } from '../../contexts/UserContext';
import { bouncingMotion } from '../../styles/motions/bouncing-icons'
import { componentMotion } from '../../styles/motions/menu-components';
import NoteMessage from './NoteMessage';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import trashBin from '../../styles/imgs/trash-bin.png';
import '../../styles/notifications.css';

const Notifications = () => {
  const { usersList, setUsersList, setLoading, setFoundErr } = useContext(MenuContext);
  const { userData, dispatchUserData } = useContext(UserContext);

  const handleRemove = (...ntsIds) => async () => {
    const rmBody = { ntsIds, username: userData.name };
    const { data } =  await axios.post(`${process.env.APP_ADDR}/users/notifications_remove`, rmBody);
    if (!data.removed) return;
    dispatchUserData({
      type: 'REFRESH_DATA',
      data: { 
        notifications: usersList.length - ntsIds.length  
      }
    });
    const ntsLast = usersList.filter(ntf => !ntsIds.includes(ntf.id)); 
    setUsersList(ntsLast);
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {  
        const ntsBody = { name: userData.name };
        const { data } =  await axios.post(`${process.env.APP_ADDR}/users/notifications_list`, ntsBody);
        const { notifications } = data;
        if (notifications) {
          setUsersList(notifications);
          if (userData.notifications !== notifications.length)
            dispatchUserData({
              type: 'REFRESH_DATA',
              data: { notifications: notifications.length }
            });      
        }
      } catch {
        const msg = 'It\'s a secret, but something terrible happened on the DichBox server...';
        setFoundErr(['server', msg]);
      } finally {
        setLoading(false);
      }
    };

    if (!usersList && userData.name)
      fetchNotifications();
  }, [userData]);

  return (
    <motion.div { ...componentMotion } data-testid="notifications-test" className="menu-form">
      <h1 id="nts-header">Notifications{ 
        !!(usersList?.length) && <span> ({ usersList.length })</span> 
      }</h1>
      { !(usersList?.length) ?
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
                <motion.img
                  src={ trashBin } className="ntf-remove" onClick={ handleRemove(ntf.id) }
                  { ...bouncingMotion }
                />
              </div>
              <NoteMessage {...{ type: ntf.type, userName: ntf.user_name, userColor: ntf.user_color, boxName: ntf.box_name, boxColor: ntf.box_color, msg: ntf.msgEntries }} />
            </div>
          ))}
        </div>
      }
    </motion.div>
  );
};

export default Notifications;
