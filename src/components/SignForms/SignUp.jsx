import React from 'react';
import SignField from '../inputFields/SignField';

const SignUp = ({ submitSignUp, getOnChangeVerifier, submitButton, warnings }) => (
  <form className="sign-form" onSubmit={ submitSignUp } >
    <SignField {...{ warning: warnings.name, label: 'usermane', type: 'text', handleOnChange: getOnChangeVerifier('name') }} />
    <SignField {...{ warning: warnings.email, label: 'email', type: 'email', handleOnChange: getOnChangeVerifier('email') }} />
    <SignField {...{ warning: warnings.passwd, label: 'password', type: 'password', handleOnChange: getOnChangeVerifier('passwd') }} />
    <input className="form-submit" type="submit" value="create account" disabled={ submitButton.disabled } style={ submitButton.style } />
  </form>
);

export default SignUp;
