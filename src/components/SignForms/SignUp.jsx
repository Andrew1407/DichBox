import React from 'react';

const SignUp = () => {
  return (
    <form className="sign-form">
      <div className="sign-field">
        <p>username:</p>
        <input type="text"/>
      </div>
      <div className="sign-field">
        <p>email:</p>
        <input type="email"/>
      </div>
      <div className="sign-field">
        <p>password:</p>
        <input type="password"/>
      </div>
      <input className="form-submit" type="submit" value="create account"/>
    </form>
  );
};

export default SignUp;
