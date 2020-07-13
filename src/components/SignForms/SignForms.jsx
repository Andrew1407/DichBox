import React, { useState } from 'react';
import SignUp from './SignUp';
import SignIn from './SignIn';
import '../../styles/sign-forms.css';

const SingForms = () => {
  const [isSignUp, setSignModifier] = useState(true);
  const handleSingForm = modifier => e => {
    e.preventDefault();
    setSignModifier(modifier);
  };
  const setBtnStateStyle = modifier => (
    modifier ? { backgroundColor: 'rgb(0, 217, 255)', color: 'black' } :
    { backgroundColor: 'black', color: 'rgb(0, 217, 255)' }
  );

  return (
    <div id="sign">
      <div id="sign-switch">
        <p onClick={ handleSingForm(true) } style={ setBtnStateStyle(isSignUp) }>sing up</p>
        <p onClick={ handleSingForm(false) } style={ setBtnStateStyle(!isSignUp) }>sing in</p>
      </div>
      { isSignUp ? <SignUp /> : <SignIn /> }
    </div>
  );
};

export default SingForms;
