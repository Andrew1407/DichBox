import React, { useContext, useState, useEffect } from 'react';
import { MainContext } from '../../contexts/MainContext';
import '../../styles/menu-default.css';
import logoDefault from '../../styles/imgs/default-user-logo.png';


const Default = ({ setMenuOption }) => {
  const { userData } = useContext(MainContext);
  const handeMenuChoice = choice => e => {
    e.preventDefault();
    setMenuOption(choice)
  };

  
  return (
    <div id="menu-default">
      <img src={logoDefault} id="default-logo" />
      <div id="un-desc">
        <p id="default-username" style={{ color: userData.name_color }} >{ userData.name }</p>
        <p id="default-desc" style={{ color: userData.description_color }} >{ userData.description }</p>
      </div>
      <div id="default-choice">
        <p id="default-edit" onClick={ handeMenuChoice('editProfile') }>edit profile</p>
        <p id="default-boxes" onClick={ handeMenuChoice('boxes') }>boxes</p>
        { userData.ownPage && <p>subscriptions</p>}
        { userData.ownPage && <p>notifications</p>}
      </div>
      <p className="default-extra" >
        folowers:
        <span id="extra-followers"> {userData.followers}</span>
      </p>
      { userData.ownPage && <p className="default-extra" id="default-regdate">
        email:
        <span id="extra-email"> {userData.email}</span>
      </p>}
      <p className="default-extra" id="default-regdate">
        signed:
        <span id="extra-reg-date"> {userData.reg_date}</span>
      </p>
      <div id="sign-options">
        <p>remove account</p>
        <p>sign out</p>
      </div>
    </div>
  );
};

export default Default;
