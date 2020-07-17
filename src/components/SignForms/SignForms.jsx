import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import SignUp from './SignUp';
import SignIn from './SignIn';
import { MainContext } from '../../contexts/MainContext';
import '../../styles/sign-forms.css';

const SingForms = () => {
  const [isSignUp, setSignModifier] = useState(true);
  const { setUserData } = useContext(MainContext);
  const handleSingForm = modifier => e => {
    e.preventDefault();
    setSignModifier(modifier);
  };
  const setBtnStateStyle = modifier => (
    modifier ? { backgroundColor: 'rgb(0, 217, 255)', color: 'black' } :
    { backgroundColor: 'black', color: 'rgb(0, 217, 255)' }
  );
  const history = useHistory();
  const [userDataInput, setUserDataInput] = useState({});
  const signProps = { setUserData, userDataInput, setUserDataInput, history };


  return (
    <div id="sign">
      <div id="sign-switch">
        <p onClick={ handleSingForm(true) } style={ setBtnStateStyle(isSignUp) }>sing up</p>
        <p onClick={ handleSingForm(false) } style={ setBtnStateStyle(!isSignUp) }>sing in</p>
      </div>
      { isSignUp ? <SignUp {...signProps} /> : <SignIn {...signProps} /> }
    </div>
  );
};

export default SingForms;
