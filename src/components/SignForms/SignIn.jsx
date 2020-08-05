import React from 'react';
import SignField from '../inputFields/SignField';

const SignIn = ({ submitSignIn, getOnChangeVerifier, submitButton, warnings }) => (
  <form className="sign-form" onSubmit={ submitSignIn } >
    <SignField {...{ warning: warnings.email, label: 'email', type: 'email', handleOnChange: getOnChangeVerifier('email') }} />
    <SignField {...{ warning: warnings.passwd, label: 'password', type: 'password', handleOnChange: getOnChangeVerifier('passwd') }} />
    <input className="form-submit" type="submit" value="sign in" disabled={ submitButton.disabled } style={ submitButton.style } />
  </form>
);

export default SignIn;
