import React from 'react';

const SignIn = ({ submitSignIn, updateUserData, submitButton, warnings }) => {
  const { email, passwd } = warnings;

  return (
    <form className="sign-form" onSubmit={ submitSignIn } >
      <div className="sign-field">
        <p>email:</p>
        <input type="email" onChange={ updateUserData('email') } style={email ? { borderBottomColor: email.borderColor } : null} />
        <i className="warning">{email ? email.text : null}</i>
      </div>
      <div className="sign-field">
        <p>password:</p>
        <input type="password" onChange={ updateUserData('passwd') } style={passwd ? { borderBottomColor: passwd.borderColor } : null} />
        <i className="warning">{passwd ? passwd.text : null}</i>
      </div>
      <input className="form-submit" type="submit" value="sign in" disabled={ submitButton.disabled } style={ submitButton.style } />
    </form>
  )
};

export default SignIn;
