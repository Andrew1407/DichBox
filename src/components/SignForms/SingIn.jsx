import React from 'react';

const SignIn = () => {
  return (
    <form className="sign-form">
      <div className="sign-field">
        <p>email: </p>
        <input className="sing-field" type="email" />
      </div>
      <div className="sign-field">
        <p>password: </p>
        <input type="password" />
      </div>
      <div className="form-submit">
        <input type="submit" value="confirm"/>
      </div>
    </form>
  );
}

export default SignIn;
