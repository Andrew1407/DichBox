import React from 'react';

const SignIn = () => {
  return (
    <form className="sign-form">
      <div className="sign-field">
        <p>email:</p>
        <input type="email"/>
      </div>
      <div className="sign-field">
        <p>password:</p>
        <input type="password"/>
      </div>
      <input className="form-submit" type="submit" value="sing in"/>
    </form>
  );
};

export default SignIn;
