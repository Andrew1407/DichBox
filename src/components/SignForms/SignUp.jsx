import React from 'react';

const SignUp = ({ submitSignUp, updateUserData, submitButton, warnings }) => (
  <form className="sign-form" onSubmit={ submitSignUp } >
    <div className="sign-field">
      <p>username:</p>
      <input type="text" onChange={ updateUserData('name') }  style={{ borderBottomColor: warnings.name.borderColor }} />
      <i className="warning">{warnings.name.text}</i>
    </div>
    <div className="sign-field">
      <p>email:</p>
      <input type="email"  onChange={ updateUserData('email') }  style={{ borderBottomColor: warnings.email.borderColor }} />
      <i className="warning">{warnings.email.text}</i>
    </div>
    <div className="sign-field">
      <p>password:</p>
      <input type="password"  onChange={ updateUserData('passwd') }  style={{ borderBottomColor: warnings.passwd.borderColor }} />
      <i className="warning">{warnings.passwd.text}</i>
    </div>
    <input className="form-submit" type="submit" value="create account" disabled={ submitButton.disabled } style={ submitButton.style } />
  </form>
);

export default SignUp;
