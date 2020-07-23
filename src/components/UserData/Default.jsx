import React, { useContext, useState, useEffect } from 'react';
import { MainContext } from '../../contexts/MainContext';
import '../../styles/menu-default.css';
import logoDefault from '../../styles/imgs/default-user-logo.png';


const Default = () => {
  const { userData } = useContext(MainContext);
    
  return (
    <div id="menu-default">
      <img src={logoDefault} id="default-logo" />
      <p id="default-username">{ userData.name }</p>
      <p id="default-desc">{ userData.description }</p>
      {userData.ownPage && <p>{ userData.email }</p>}
      <p id="default-edit" >edit profile</p>
      <p id="default-boxes" >boxes</p>
      <p id="default-regdate">
        signed:
        <span> {userData.reg_date}</span>
      </p>
      <div id="exit-options">
        <p>remove account</p>
        <p>sign out</p>
      </div>
    </div>
  );
};

export default Default;
