import React, { useContext, useState, useEffect } from 'react';
import { useHistory, Route } from 'react-router-dom';
import { MainContext } from '../../contexts/MainContext';
import Boxes from './Boxes';

const UserData = () => {
  const { userData } = useContext(MainContext);
  const history = useHistory();
  const params = new URLSearchParams(history.location.search)
  const menuCurrect = params.get('menu');

  return (
    <div>
      <h1>{ menuCurrect }</h1>
      <ul>
        {Object.entries(userData)
          .map(([ key, value ]) => 
            <li>{key}: {value}</li>
        )}
      </ul>
    </div>
  );
};

export default UserData;
