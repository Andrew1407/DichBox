import React, { useState } from 'react';
import axios from 'axios';

const SignUp = ({ setUserData, userDataInput, setUserDataInput, history }) => {
  const updateUserData = inputField => async e => {
    e.preventDefault();
    const inputValue = e.target.value;
    const isVerifyField = /^(email|name)$/.test(inputField);
    setUserDataInput({ ...userDataInput, [inputField]: inputValue });
    if (isVerifyField) {
      const verifyBody = { inputValue, inputField };
      const { data } = await axios.post('http://192.168.0.223:7041/users/verify', verifyBody);
      console.log(data);
    }
  };
  const submitSignIn = async e => {
    e.preventDefault();
    const { data } = await axios.post('http://192.168.0.223:7041/users/create', userDataInput);
    setUserData(data);
    history.push('/');
  };


  return (
    <form className="sign-form" onSubmit={ submitSignIn } >
      <div className="sign-field">
        <p>username:</p>
        <input type="text" onChange={ updateUserData('name') } />
      </div>
      <div className="sign-field">
        <p>email:</p>
        <input type="email"  onChange={ updateUserData('email') } />
      </div>
      <div className="sign-field">
        <p>password:</p>
        <input type="password"  onChange={ updateUserData('passwd') } />
      </div>
      <input className="form-submit" type="submit" value="create account" />
    </form>
  );
};

export default SignUp;
