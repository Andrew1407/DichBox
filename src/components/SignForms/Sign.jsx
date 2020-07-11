import React, { useState } from 'react';
import SignIn from './SingIn';
import SignUp from './SingUp';
import '../../styles/sign-forms.css';

const Sign = () => {
  const [ signInForm, setSingIn ] = useState(true);
  const buttonStyle = {
    active: { backgroundColor: 'rgb(0, 217, 255)', color: 'black' },
    inactive:  {backgroundColor: 'black', color: 'rgb(0, 217, 255)' }
  };
  const setButtonState = isActive => (
    isActive ? buttonStyle.active : buttonStyle.inactive
  ); 
  const SingInOnClick = isSingIn => e => {
    e.preventDefault();
    setSingIn(isSingIn);
  };
  return (
    <div id="sign-wrap">
      <div id="sign-switch">
        <button style={setButtonState(signInForm)} onClick={SingInOnClick(true)}>sign in</button>
        <button style={setButtonState(!signInForm)} onClick={SingInOnClick(false)}>sign up</button>
      </div>
      {signInForm ? <SignIn /> : <SignUp />}
    </div>
  )
};

export default Sign;
