import React, { useState, useContext, useCallback } from 'react';
import axios from 'axios';
import SignUp from './SignUp';
import SignIn from './SignIn';
import { MainContext } from '../../contexts/MainContext';
import { VerifiersContext } from '../../contexts/VerifiersContext';
import '../../styles/sign-forms.css';

const SingForms = () => {
  const { setId, id } = useContext(MainContext);  
  const {
    useVerifiers,
    fetchInput,
    warnings,
    setWarning, 
    correctInput,
    setCorrectState,
    userDataInput
  } = useContext(VerifiersContext);
  const [isSignUp, setSignModifier] = useState(true);
  const setBtnStateStyle = modifier => (
    modifier ? { backgroundColor: 'rgb(0, 217, 255)', color: 'black' } :
    { backgroundColor: 'black', color: 'rgb(0, 217, 255)' }
  );

  const signInVerParams = {
    email: {
      regExp: /^([a-z_\d\.-]+)@([a-z\d]+)\.([a-z]{2,8})(\.[a-z]{2,8})*$/,
      warningRegExp: 'Incorrect email input form',
      warningFetch: isSignUp ?
        'This email is already taken' :
        'This email is not registered',
      fetchVerifier: async input => {
        const { foundValue } = await fetchInput('email', input);
        return isSignUp ? foundValue === input : foundValue !== input;
      }
    },
    passwd: {
      regExp: /^[\S]{5,20}$/,
      warningRegExp: 'Password length should be 5-16 symbols (no spaces)',
    }
  };
  const signUpVerParams = {
    ...signInVerParams,
    name: {
      regExp: /^(?!search$)[\S]{5,40}$/,
      warningRegExp: 'Username length should be unique, 5-40 symbols (no spaces)',
      warningFetch: 'This username is already taken',
      fetchVerifier: async input => {
        const { foundValue } = await fetchInput('name', input);
        return foundValue === input;
      }
    }
  };
  const { getVerifiersState, getOnChangeVerifier } =
    useVerifiers(isSignUp ? signUpVerParams : signInVerParams);
  const handleSignForm = modifier => e => {
    e.preventDefault();
    setWarning({});
    setCorrectState({});
    setSignModifier(modifier);
  };

  // submit handlers
  const submitSignUpClb = async e => {
    e.preventDefault();
    const isCorrect = getVerifiersState();
    if (!isCorrect) return;
    const { data } = await axios.post('http://192.168.0.223:7041/users/create', userDataInput);
    setWarning({});
    setCorrectState({});
    setId(data.id);
  };
  const submitSignUp = useCallback(submitSignUpClb, [userDataInput, id]);

  const submitSignInClb = async e => {
    e.preventDefault();
    const isCorrect = getVerifiersState();
    if (!isCorrect) return;
    const { data } = await axios.post('http://192.168.0.223:7041/users/enter', userDataInput );
    if (data.id) {
      setWarning({});
      setCorrectState({});
      setId(data.id);
    } else {
      const passwd = {
        borderColor: 'crimson',
        text: 'Wrong password'
      };
      setWarning({ ...warnings, passwd });
      setCorrectState({ ...correctInput, passwd: false });
    }
  };
  const submitSignIn = useCallback(submitSignInClb, [userDataInput, warnings, correctInput, id]);

  // submit buttom
  const ableSubmit = getVerifiersState();
  const submitButton = {
    disabled: !ableSubmit,
    style: ableSubmit ?
      { borderColor: 'rgb(0, 255, 76)', color: 'rgb(0, 255, 76)' } :
      { borderColor: 'rgb(0, 217, 255)', color: 'rgb(0, 217, 255)' }
  };

  return (
    <div id="sign">
      <div id="sign-switch">
        <p onClick={ handleSignForm(true) } style={ setBtnStateStyle(isSignUp) }>sing up</p>
        <p onClick={ handleSignForm(false) } style={ setBtnStateStyle(!isSignUp) }>sing in</p>
      </div>
      { isSignUp ? 
        <SignUp {...{ submitSignUp, getOnChangeVerifier, submitButton, warnings }} /> :
        <SignIn {...{ submitSignIn, getOnChangeVerifier, submitButton, warnings }} /> 
      }
    </div>
  );
};

export default SingForms;
