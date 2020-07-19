import React from 'react';

const SignIn = ({ submitSignIn, updateUserData, submitButton, warnings }) => (
  <form className="sign-form" onSubmit={ submitSignIn } >
    <div className="sign-field">
      <p>email:</p>
      <input type="email" onChange={ updateUserData('email') } style={{ borderBottomColor: warnings.email.borderColor }} />
      <i className="warning">{warnings.email.text}</i>
    </div>
    <div className="sign-field">
      <p>password:</p>
      <input type="password" onChange={ updateUserData('passwd') } style={{ borderBottomColor: warnings.passwd.borderColor }} />
      <i className="warning">{warnings.passwd.text}</i>
    </div>
    <input className="form-submit" type="submit" value="sign in" disabled={ submitButton.disabled } style={ submitButton.style } />
  </form>
);

export default SignIn;
