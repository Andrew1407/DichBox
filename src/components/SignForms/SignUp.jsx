import React from 'react';

const SignUp = ({ submitSignUp, getOnChangeVerifier, submitButton, warnings }) => {
  const { name, email, passwd } = warnings;

  return (
    <form className="sign-form" onSubmit={ submitSignUp } >
      <div className="sign-field">
        <p>username:</p>
        <input type="text" onChange={ getOnChangeVerifier('name') } style={{ borderBottomColor: name && name.borderColor }} />
        <i className="warning">{name ? name.text : null}</i>
      </div>
      <div className="sign-field">
        <p>email:</p>
        <input type="email"  onChange={ getOnChangeVerifier('email') } style={{ borderBottomColor: email && email.borderColor }} />
        <i className="warning">{email ? email.text : null}</i>
      </div>
      <div className="sign-field">
        <p>password:</p>
        <input type="password"  onChange={ getOnChangeVerifier('passwd') } style={{ borderBottomColor: passwd && passwd.borderColor }} />
        <i className="warning">{passwd ? passwd.text : null}</i>
      </div>
      <input className="form-submit" type="submit" value="create account" disabled={ submitButton.disabled } style={ submitButton.style } />
    </form>
  )
};

export default SignUp;
