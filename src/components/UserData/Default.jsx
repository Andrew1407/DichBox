import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import { MenuContext } from '../../contexts/MenuContext';
import ConfirmModal from '../../modals/ConfirmModal';
import '../../styles/menu-default.css';
import logoDefault from '../../styles/imgs/default-user-logo.png';


const Default = () => {
  const history = useHistory();
  const { userData, username, dispatchUsername, dispatchUserData, setPathName } = useContext(UserContext);
  const { setMenuOption } = useContext(MenuContext);
  const [modalOptions, setModalOptions] = useState(null);
  const logo = userData.logo ? userData.logo : logoDefault;
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
    history.push('/');
  };

  const removeOkClb = async () => {
    const rmBody = { username, confirmation: 'permitted' }
    const { data } = await axios.post(`${process.env.APP_ADDR}/users/remove`, rmBody);
    if (data.removed)
      signOutOkClb();
  };

  const handleSubscribtion = action => async () => {
    const subsBody = {
      action,
      personName: username,
      subscriptionName: userData.name
    };
    const { data } = await axios.post(`${process.env.APP_ADDR}/users/subscription`, subsBody);
    if (data.followe === null) return;
    const { follower, followers } = data;
    dispatchUserData({ type: 'REFRESH_DATA', data: { follower, followers } });
  };

  return (
    <div className="menu-form">
      <img src={ logo } id="default-logo" />
      <div className="name-desc">
        <p className="nd-name" style={{ color: userData.name_color }} >{ userData.name }</p>
        <p className="nd-desc" style={{ color: userData.description_color }} >{ userData.description }</p>
      </div>
      <div className="menu-options-list">
        { !userData.ownPage && !!username &&
          ( userData.follower ?
            <p style={{ color: 'rgb(204, 0, 255)' }} onClick={ handleSubscribtion('unsubscribe') } >unsubscribe</p> :
            <p style={{ color: 'rgb(0, 255, 76)' }} onClick={ handleSubscribtion('subscribe') } >subscribe</p>
          )
        }
        { userData.ownPage && <p id="default-edit" onClick={ handeMenuChoice('editProfile') }>edit profile</p> }
        <p id="default-boxes" onClick={ handeMenuChoice('boxes') }>boxes</p>
        { userData.ownPage && <p onClick={ handeMenuChoice('subscriptions') }>subscriptions</p> }
        { userData.ownPage && <p>notifications</p> }
      </div>
      <p className="default-extra" >
        folowers:
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
        <p onClick={ handleSignOptions('Remove this account inevitably', removeOkClb) } >remove account</p>
        <p onClick={ handleSignOptions('Sign out', signOutOkClb) } >sign out</p>
        <ConfirmModal { ...modalOptions } />
      </div> }
    </div>
  );
};

export default Default;
