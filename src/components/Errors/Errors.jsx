import React, { useContext } from 'react';
import { MenuContext } from '../../contexts/MenuContext';
import boxErrLogo from '../../styles/imgs/errors/box.png';
import dirErrLogo from '../../styles/imgs/errors/dir.png';
import serverErrLogo from '../../styles/imgs/errors/server.png';
import signInErrLogo from '../../styles/imgs/errors/signIn.png';
import userErrLogo from '../../styles/imgs/errors/user.png';
import signUpErrLogo from '../../styles/imgs/errors/signUp.png';
import '../../styles/errors.css';

const Errors = () => {
  const { foundErr } = useContext(MenuContext);
  const [logoKey, errMessage] = foundErr;
  const errLogos = {
    dir: dirErrLogo,
    box: boxErrLogo,
    user: userErrLogo,
    signIn: signInErrLogo,
    signUp: signUpErrLogo,
    server: serverErrLogo
  };

  return (
    <div className="menu-form">
      <h1 id="error-title"> Error</h1>
      <p id="error-message">{ errMessage }</p>
      <div id="error-image">
        <img src={ errLogos[logoKey] }/>
      </div>
    </div>
  );
}

export default Errors;
