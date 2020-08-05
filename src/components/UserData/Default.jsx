import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';
import ConfirmModal from '../../modals/ConfirmModal';
import '../../styles/menu-default.css';
import logoDefault from '../../styles/imgs/default-user-logo.png';


const Default = ({ setMenuOption }) => {
  const history = useHistory();
  const { userData, id, dispatchId, dispatchUserData, setUsername } = useContext(UserContext);
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
    dispatchId({ type: 'REMOVE_ID' });
    dispatchUserData({ type: 'CLEAN_DATA' });
    setUsername('');
    setModalOptions(null);
    history.push('/')
  };

  const removeOkClb = async () => {
    const rmBody = { id, confirmation: 'permitted' }
    const { data } = await axios.post('http://192.168.0.223:7041/users/remove', rmBody);
    if (data.removed) {
      signOutOkClb();
    }
  };

  
  return (
    <div id="menu-default">
      <img src={ logo } id="default-logo" />
      <div id="un-desc">
        <p id="default-username" style={{ color: userData.name_color }} >{ userData.name }</p>
        <p id="default-desc" style={{ color: userData.description_color }} >{ userData.description }</p>
      </div>
      <div id="default-choice">
        { !userData.ownPage && id &&
          ( userData.follower ?
            <p>unsubscribe</p> :
            <p>subscribe</p>
          )
        }
        { userData.ownPage && <p id="default-edit" onClick={ handeMenuChoice('editProfile') }>edit profile</p> }
        <p id="default-boxes" onClick={ handeMenuChoice('boxes') }>boxes</p>
        { userData.ownPage && <p>subscriptions</p> }
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
