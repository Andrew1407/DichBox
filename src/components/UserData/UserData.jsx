import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { MainContext } from '../../contexts/MainContext';

const UserData = () => {
  const { username } = useParams();
  const { userData } = useContext(MainContext);
  return (
    <div>
      <h1>{username}</h1>
      <ul style={{fontSize: '200%'}}>
        {Object.entries(userData)
          .map(([key, value]) => 
            <li>{key}: {value}</li>
        )}
      </ul>
    </div>
  );
};

export default UserData;
