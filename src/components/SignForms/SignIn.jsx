import React from 'react';
import axios from 'axios';

const SignIn = ({ setUserData, userDataInput, setUserDataInput, history }) => {
  const updateUserData = field => e => {
    e.preventDefault();
    setUserDataInput({ ...userDataInput, [field]: e.target.value });
  };
  const submitSignUp = async e => {
    e.preventDefault();
    const { data } = await axios.post('http://192.168.0.223:7041/users/enter', userDataInput );
    setUserData(data);
    history.push('/');
  };

  return (
    <form className="sign-form" onSubmit={ submitSignUp }>
      <div className="sign-field">
        <p>email:</p>
        <input type="email" onChange={ updateUserData('email') } />
      </div>
      <div className="sign-field">
        <p>password:</p>
        <input type="password" onChange={ updateUserData('passwd') } />
      </div>
      <input className="form-submit" type="submit" value="sing in"/>
    </form>
  );
};

export default SignIn;
