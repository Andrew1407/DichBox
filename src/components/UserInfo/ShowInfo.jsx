import React from 'react';
import defaultLogo from '../../styles/imgs/user-default-icon.png';

const ShowInfo = () => {
  return ( 
    <div className="user-info show">
      <img className="user-logo user-data" src={defaultLogo} />
      <div className="user-data">
        <p><b>username: </b><big>{"dich"}</big></p>
      </div>
      <div className="user-data">
        <p><b>email: </b><big>{"dich"}</big></p>
      </div>
      <div className="user-data show-desc">
        <p>
          <b>description: </b> <br/>
          <big>{"dich"}</big>
          </p>
      </div>
    </div>
  );
};

export default ShowInfo;
