import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { UserContext } from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';
import { BoxesContext } from '../../contexts/BoxesContext';
import ConfirmModal from '../../modals/ConfirmModal';
import { itemMotion, signOutMotion } from  '../../styles/motions/list-items';
import { componentMotion } from '../../styles/motions/menu-components';
import logoDefault from '../../styles/imgs/default-user-logo.png';
import '../../styles/menu-default.css';

const Default = () => {
  const history = useHistory();
  const { userData, username, dispatchUsername, dispatchUserData, setPathName } = useContext(UserContext);
  const { setMenuOption, openedFiles, dispatchOpenedFiles } = useContext(MenuContext);
  const { boxDetails, setBoxDetails, setPathEntries } = useContext(BoxesContext);
  const [modalOptions, setModalOptions] = useState(null);
  const handeMenuChoice = choice => e => {
    e.preventDefault();
    setMenuOption(choice)
  };
  const handleSignOptions = (message, okClb) => () => setModalOptions({
    setModalOptions,
    isOpen: true,
    message,
    okClb
  });
  const signOutOkClb = () => {
    dispatchUsername({ type: 'REMOVE_NAME' });
    setModalOptions(null);
    dispatchUserData({ type: 'CLEAN_DATA' });
    setPathName('');
    if (openedFiles.length)
      dispatchOpenedFiles({ type: 'FILES_CLOSE_ALL' });
    history.push('/');
  };

  const removeOkClb = async () => {
    const rmBody = { username, confirmation: 'permitted' }
    const { data } = await axios.post(`${process.env.APP_ADDR}/users/remove`, rmBody);
    if (data.removed) signOutOkClb();
  };

  const handleSubscribtion = action => async () => {
    const subsBody = {
      action,
      personName: username,
      subscriptionName: userData.name,
      responseValues: true
    };
    const { data } = await axios.post(`${process.env.APP_ADDR}/users/subscription`, subsBody);
    if (data.followers === undefined) return;
    const { follower, followers } = data;
    dispatchUserData({ type: 'REFRESH_DATA', data: { follower, followers } });
  };

  useEffect(() => {
    setPathEntries([]);
    if (Object.keys(boxDetails).length)
      setBoxDetails({});
  }, []);

  return (
    <motion.div { ...componentMotion } data-testid="default-test" className="menu-form">
      <img src={ userData.logo || logoDefault } id="default-logo" />
      <div className="name-desc">
        <p className="nd-name" style={{ color: userData.name_color }} >{ userData.name }</p>
        <p className="nd-desc" style={{ color: userData.description_color }} >{ userData.description }</p>
      </div>
      <div id="default-options" className="menu-options-list">
        { !userData.ownPage && !!username &&
          ( userData.follower ?
            <motion.p
              { ...itemMotion }
              style={{ color: 'rgb(204, 0, 255)' }} onClick={ handleSubscribtion('unsubscribe') }
            >unsubscribe</motion.p> :
            <motion.p
              { ...itemMotion }
              style={{ color: 'rgb(0, 255, 76)' }} onClick={ handleSubscribtion('subscribe') }
            >subscribe</motion.p>
          )
        }
        { userData.ownPage &&
          <motion.p
            { ...itemMotion }
            id="default-edit" onClick={ handeMenuChoice('editProfile') }
          >edit profile</motion.p>
        }
        <motion.p
          { ...itemMotion }
          id="default-boxes" onClick={ handeMenuChoice('boxes') }
        >boxes</motion.p>
        { userData.ownPage && <motion.p
            { ...itemMotion }
            onClick={ handeMenuChoice('subscriptions') }
          >subscriptions</motion.p>
        }
        { userData.ownPage && <motion.p
            { ...itemMotion }
            onClick={ handeMenuChoice('notifications') }
            >notifications{ !!(+userData.notifications) && <span style={{ color: 'orange' }}
          > ({ userData.notifications })</span> }</motion.p>
        }
      </div>
      <p className="default-extra">
        followers:
        <span id="extra-followers"> { userData.followers }</span>
      </p>
      { userData.ownPage && <p className="default-extra" id="default-regdate">
        email:
        <span id="extra-email"> { userData.email }</span>
      </p>}
      <p className="default-extra" id="default-regdate">
        signed:
        <span id="extra-reg-date"> { userData.reg_date }</span>
      </p>
      { userData.ownPage && <div id="sign-options">
        <motion.p
          { ...itemMotion }
          onClick={ handleSignOptions('Remove this account', removeOkClb) }
        >remove account</motion.p>
        <motion.p
          { ...signOutMotion }
          onClick={ handleSignOptions('Sign out', signOutOkClb) }
        >sign out</motion.p>
        <ConfirmModal { ...modalOptions } />
      </div> }
    </motion.div>
  );
};

export default Default;
